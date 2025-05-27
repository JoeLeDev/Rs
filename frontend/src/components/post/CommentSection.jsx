import { useState } from "react";
import { Trash, Pencil, EyeOff } from "lucide-react";
import API from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

const CommentSection = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    await API.post(`/posts/${post._id}/comments`, { content: newComment });
    setNewComment("");
    onUpdate();
  };

  const handleEdit = async (commentId) => {
    await API.patch(`/posts/${post._id}/comments/${commentId}`, {
      content: editingContent,
    });
    setEditingId(null);
    onUpdate();
  };

  const handleDelete = async (commentId) => {
    await API.delete(`/posts/${post._id}/comments/${commentId}`);
    onUpdate();
  };

  const handleHide = async (commentId) => {
    await API.patch(`/posts/${post._id}/comments/${commentId}/hide`);
    onUpdate();
  };

  const canDelete = (comment) =>
    ["admin", "gestionnaire_groupe", "pilote"].includes(user?.role);

  const canEdit = (comment) => comment.author._id === user?._id;

  const canHide = post.author._id === user?._id;

  return (
    <div className="mt-4 space-y-2">
      {post.comments.map((comment) =>
        !comment.hidden && (
          <div key={comment._id} className="border p-2 rounded bg-gray-50">
            {editingId === comment._id ? (
              <div className="flex gap-2">
                <input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="border px-2 py-1 flex-1"
                />
                <button onClick={() => handleEdit(comment._id)}>💾</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  <strong>{comment.author.username}</strong> :{" "}
                  {comment.content}
                </p>
                <div className="flex gap-2 text-sm mt-1 text-gray-500">
                  {canEdit(comment) && (
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditingContent(comment.content);
                      }}
                    >
                      <Pencil className="w-4 h-4 inline" />
                    </button>
                  )}
                  {canDelete(comment) && (
                    <button onClick={() => handleDelete(comment._id)}>
                      <Trash className="w-4 h-4 inline" />
                    </button>
                  )}
                  {canHide && (
                    <button onClick={() => handleHide(comment._id)}>
                      <EyeOff className="w-4 h-4 inline" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="border px-2 py-1 flex-1"
        />
        <button
          onClick={handleAdd}
          
          className="bg-blue-600 text-white px-4 rounded"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
