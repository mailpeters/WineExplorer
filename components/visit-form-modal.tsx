'use client';

import { useState } from 'react';
import { Winery } from '@/types/winery';
import { WineryVisit } from '@/types/visit';
import { useSession } from 'next-auth/react';

interface VisitFormModalProps {
  winery: Winery;
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: WineryVisit) => void;
}

export default function VisitFormModal({ winery, isOpen, onClose, onSave }: VisitFormModalProps) {
  const { data: session } = useSession();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    visitDate: today,
    winesLoved: '',
    winesDisliked: '',
    boughtBottle: '',
    wouldRecommend: true,
    howLongStayed: '',
    whatStoodOut: '',
    shareWithVineyard: false,
    comments: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      alert('You must be logged in to save a visit.');
      return;
    }

    // Convert photos to base64 strings
    const photoPromises = photos.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const photoBase64 = await Promise.all(photoPromises);

    const visit: WineryVisit = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wineryId: winery.id,
      wineryName: winery.name,
      userId: session.user.email,
      visitDate: formData.visitDate,
      winesLoved: formData.winesLoved,
      winesDisliked: formData.winesDisliked,
      boughtBottle: formData.boughtBottle,
      wouldRecommend: formData.wouldRecommend,
      howLongStayed: formData.howLongStayed,
      whatStoodOut: formData.whatStoodOut,
      shareWithVineyard: formData.shareWithVineyard,
      comments: formData.comments,
      photos: photoBase64,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(visit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Record Your Visit</h2>
              <p className="text-purple-100 text-sm mt-1">{winery.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Visit Date */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Visit Date
            </label>
            <input
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Wines You Loved */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Wines You Loved
            </label>
            <textarea
              name="winesLoved"
              value={formData.winesLoved}
              onChange={handleInputChange}
              placeholder="Which wines did you enjoy? List varietals, blends, or specific bottles..."
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
            />
          </div>

          {/* Wines You Disliked */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Wines You Disliked
            </label>
            <textarea
              name="winesDisliked"
              value={formData.winesDisliked}
              onChange={handleInputChange}
              placeholder="Any wines that weren't your favorite?"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
            />
          </div>

          {/* Bought a Bottle */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Bought a Bottle?
            </label>
            <input
              type="text"
              name="boughtBottle"
              value={formData.boughtBottle}
              onChange={handleInputChange}
              placeholder="Which bottles did you purchase?"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Would Recommend */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="wouldRecommend"
                checked={formData.wouldRecommend}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded accent-purple-500"
              />
              <span className="font-semibold text-purple-900">Would you recommend to friends?</span>
            </label>
          </div>

          {/* How Long You Stayed */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              How Long You Stayed
            </label>
            <input
              type="text"
              name="howLongStayed"
              value={formData.howLongStayed}
              onChange={handleInputChange}
              placeholder="e.g., 2 hours, 45 minutes, all afternoon..."
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* What Stood Out */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              What Stood Out
            </label>
            <textarea
              name="whatStoodOut"
              value={formData.whatStoodOut}
              onChange={handleInputChange}
              placeholder="What made this visit memorable? The view, the staff, the atmosphere..."
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
            />
          </div>

          {/* Share with Vineyard */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="shareWithVineyard"
                checked={formData.shareWithVineyard}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded accent-purple-500"
              />
              <span className="font-semibold text-purple-900">
                Share your experience with the vineyard? (Anyone to thank?)
              </span>
            </label>
          </div>

          {/* Comments/Notes */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Additional Comments/Notes
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Any other thoughts, memories, or details you'd like to remember..."
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Photo Uploads
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-purple-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-lg"
            >
              Save Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
