const Post = require("../models/Post");
const mongoose = require("mongoose");

// Créer un post
exports.createPost = async (req, res) => {
  const { content, fileUrl, fileType, group } = req.body;

  try {
    const post = await Post.create({
      content,
      fileUrl,
      fileType,
      group: group || null,
      author: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du post" });
  }
};

// Récupérer les posts d’un groupe
exports.getPostsByGroup = async (req, res) => {
  const groupId = mongoose.Types.ObjectId.createFromHexString(
    req.params.groupId
  );
  const page = parseInt(req.query.page) || 1;
  const initialLimit = 10;
  const loadMoreLimit = 5;

  const limit = page === 1 ? initialLimit : loadMoreLimit;
  const skip = page === 1 ? 0 : initialLimit + (page - 2) * loadMoreLimit;

  try {
    const posts = await Post.find({ group: groupId })
      .populate("author", "username email")
      .populate("comments.author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ group: groupId });
    const hasMore = skip + posts.length < total;

    res.json({ posts, hasMore });
    console.log("Group ID:", req.params.groupId);
    console.log("Page:", req.query.page);
  } catch (err) {
    console.error("Erreur getPostsByGroup:", err);
    res.status(500).json({ message: "Erreur de récupération" });
  }
};

// Récupérer les posts du dashboard (sans groupe)
exports.getDashboardPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const initialLimit = 10;
  const loadMoreLimit = 5;

  const limit = page === 1 ? initialLimit : loadMoreLimit;
  const skip = page === 1 ? 0 : initialLimit + (page - 2) * loadMoreLimit;

  try {
    const posts = await Post.find({ group: null })
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ group: null });
    const hasMore = skip + posts.length < total;

    res.json({ posts, hasMore });
  } catch {
    res.status(500).json({ message: "Erreur de récupération" });
  }
};

// Modifier un post
exports.updatePost = async (req, res) => {
  const { content, fileUrl, fileType } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    console.log("Post author:", post.author.toString());
    console.log("User ID:", req.user.id);
    // Seul l'auteur peut modifier
    if (!post.author.equals(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    post.content = content || post.content;
    post.fileUrl = fileUrl || post.fileUrl;
    post.fileType = fileType || post.fileType;

    await post.save();
    res.json(post);
  } catch {
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
};

// Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: "Post supprimé" });
  } catch {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

// Récupérer un commentaire
exports.getComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });
    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });
    await post.populate("comments.author", "username");
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Récupérer tous les commentaires d’un post
exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });
    await post.populate("comments.author", "username");
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// ➕ Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const comment = {
      content: req.body.content,
      author: req.user.id,
    };

    post.comments.push(comment);
    await post.save();

    await post.populate("comments.author", "username");

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" });
  }
};

// ✏️ Modifier un commentaire (seul l’auteur du commentaire)
exports.editComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });

    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Tu ne peux modifier que ton propre commentaire" });
    }

    comment.content = content;
    await post.save();

    res.json({ message: "Commentaire modifié" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
};

// ❌ Supprimer un commentaire (admin, pilote, gestionnaire_groupe)
exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const post = await Post.findById(id).populate("group");
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });

    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const group = post.group;

    const isPilot = group?.roles?.some(
      (r) => r.role === "pilote" && r.userId.toString() === userId
    );
    const isManager = group?.roles?.some(
      (r) => r.role === "gestionnaire_groupe" && r.userId.toString() === userId
    );

    if (!group || !Array.isArray(group.roles)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    comment.remove();
    await post.save();

    res.json({ message: "Commentaire supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

// 🙈 Masquer un commentaire (auteur du post uniquement)
exports.hideComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Seul l’auteur du post peut masquer les commentaires",
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });

    comment.hidden = true;
    await post.save();

    res.json({ message: "Commentaire masqué" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du masquage" });
  }
};

// 👍 Aimer un post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Déjà aimé" });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du like" });
  }
};

// 👎 Ne plus aimer un post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Déjà pas aimé" });
    }

    post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du like" });
  }
};
