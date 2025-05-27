import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

const PostForm = ({ groupId = null, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !file) return toast.error("Contenu requis");

    let uploadedUrl = "";
    let fileType = "";

    try {
      // (Optionnel) upload du fichier via backend
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await API.post("/upload", formData); // ⚠️ crée route upload
        uploadedUrl = res.data.url;
        fileType = file.type.startsWith("image/") ? "image" : "other";
      }

      const postRes = await API.post("/posts", {
        content,
        fileUrl: uploadedUrl,
        fileType,
        group: groupId,
      });

      toast.success("Post créé !");
      setContent("");
      setFile(null);
      setPreview("");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      toast.error("Erreur lors de la publication");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <textarea
        className="w-full p-2 border rounded resize-none mb-2"
        placeholder="Exprime-toi..."
        rows="3"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="max-h-48 object-cover rounded mb-2"
        />
      )}

      {file && !preview && (
        <div className="text-sm text-gray-600 mb-2">📎 {file.name}</div>
      )}

      <div className="flex items-center justify-between">
        <label className="cursor-pointer text-blue-600 hover:underline text-sm">
          📎 Ajouter un fichier
          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Publier
        </button>
      </div>
    </form>
  );
};

export default PostForm;
