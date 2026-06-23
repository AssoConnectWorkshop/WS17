'use client';

import { useState } from 'react';

interface ProfileData {
  firstName: string;
  height: string;
  hairColor: string;
  shoeSize: string;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    height: '',
    hairColor: '',
    shoeSize: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.height && formData.hairColor && formData.shoeSize) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      height: '',
      hairColor: '',
      shoeSize: '',
    });
    setSubmitted(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {!submitted ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Mon Profil</h1>
            <p className="text-center text-gray-600 mb-8">Remplissez vos informations personnelles</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ex: Jean"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-2">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Ex: 180"
                  min="100"
                  max="250"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="hairColor" className="block text-sm font-semibold text-gray-700 mb-2">
                  Couleur de cheveux
                </label>
                <select
                  id="hairColor"
                  name="hairColor"
                  value={formData.hairColor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  required
                >
                  <option value="">-- Sélectionnez une couleur --</option>
                  <option value="black">Noir</option>
                  <option value="brown">Marron</option>
                  <option value="blonde">Blond</option>
                  <option value="red">Roux</option>
                  <option value="gray">Gris</option>
                  <option value="white">Blanc</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="shoeSize" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pointure
                </label>
                <input
                  type="number"
                  id="shoeSize"
                  name="shoeSize"
                  value={formData.shoeSize}
                  onChange={handleChange}
                  placeholder="Ex: 42"
                  min="20"
                  max="50"
                  step="0.5"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105"
              >
                Soumettre
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">✨</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil enregistré!</h1>
              <p className="text-gray-600">Voici vos informations</p>
            </div>

            <div className="space-y-4 mb-8 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600 font-semibold">Prénom:</span>
                <span className="text-gray-800 font-medium">{formData.firstName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600 font-semibold">Taille:</span>
                <span className="text-gray-800 font-medium">{formData.height} cm</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600 font-semibold">Couleur de cheveux:</span>
                <span className="text-gray-800 font-medium capitalize">{formData.hairColor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Pointure:</span>
                <span className="text-gray-800 font-medium">{formData.shoeSize}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105"
            >
              Recommencer
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
