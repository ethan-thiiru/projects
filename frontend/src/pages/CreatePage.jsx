import { Link, useNavigate } from "react-router";
import { useCreateProduct } from "../hooks/useProducts";
import { useState, useRef } from "react";
import { ArrowLeftIcon, FileTextIcon, ImageIcon, SparklesIcon, TypeIcon, UploadIcon, XIcon } from "lucide-react";

function CreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const fileInputRef = useRef(null);

  // Added 'actualFile' to state to hold the raw file object
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    imageUrl: "",
    actualFile: null 
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Keep reader.result for the local visual preview, but store the real file too
        setFormData({ ...formData, imageUrl: reader.result, actualFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    // ⚠️ REPLACE THESE WITH YOUR ACTUAL CLOUDINARY DETAILS ⚠️
    const cloudName = "dj7lgskir"; 
    const uploadPreset = "productify_uploads"; 

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data,
    });

    const uploadedImageData = await response.json();
    return uploadedImageData.secure_url; // This is the final, clean image URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalImageUrl = formData.imageUrl;

    // If there is an actual file, upload it to Cloudinary first
    if (formData.actualFile) {
      setIsUploadingImage(true);
      try {
        finalImageUrl = await uploadToCloudinary(formData.actualFile);
      } catch (error) {
        console.error("Image upload failed", error);
        setIsUploadingImage(false);
        return; // Stop submission if image upload fails
      }
      setIsUploadingImage(false);
    }

    // Now, send the lightweight JSON to your own backend exactly as before
    const finalProductData = {
      title: formData.title,
      description: formData.description,
      imageUrl: finalImageUrl 
    };

    createProduct.mutate(finalProductData, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeftIcon className="size-4" /> Back
      </Link>

      <div className="card bg-base-300 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">
            <SparklesIcon className="size-5 text-primary" />
            New Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* TITLE INPUT */}
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <TypeIcon className="size-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Product title"
                className="grow"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </label>

            {/* IMAGE URL INPUT */}
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <ImageIcon className="size-4 text-base-content/50" />
              <input
                type="url"
                placeholder="Paste image URL"
                className="grow text-sm"
                value={formData.actualFile ? "" : formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, actualFile: null })}
              />
            </label>

            <div className="divider text-xs opacity-50">OR</div>

            {/* FILE UPLOAD BUTTON */}
            <div className="form-control">
              <button
                type="button"
                className="btn btn-outline btn-sm gap-2"
                onClick={() => fileInputRef.current.click()}
              >
                <UploadIcon className="size-4" /> Upload from Computer
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* IMAGE PREVIEW */}
            {formData.imageUrl && (
              <div className="relative rounded-box overflow-hidden border border-base-content/10 bg-base-200">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "", actualFile: null })}
                  className="btn btn-circle btn-xs absolute top-2 right-2 bg-base-300 border-none"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            )}

            {/* DESCRIPTION */}
            <div className="form-control">
              <div className="flex items-start gap-2 p-3 rounded-box bg-base-200 border border-base-300 focus-within:border-primary">
                <FileTextIcon className="size-4 text-base-content/50 mt-1" />
                <textarea
                  placeholder="Tell us about this product..."
                  className="grow bg-transparent resize-none focus:outline-none min-h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            {createProduct.isError && (
              <div role="alert" className="alert alert-error alert-sm">
                <span>Failed to create. Try again.</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={createProduct.isPending || isUploadingImage || (!formData.imageUrl && !formData.actualFile)}
            >
              {(createProduct.isPending || isUploadingImage) ? (
                <>
                   <span className="loading loading-spinner" />
                   {isUploadingImage ? "Uploading Image..." : "Saving..."}
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;