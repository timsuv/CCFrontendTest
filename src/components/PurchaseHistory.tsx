import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface PurchaseItem {
  itemId: number;
  productName: string;
  productDescription: string;
}

interface Purchase {
  purchaseId: number;
  purchaseDate: string;
  price: number;
  items: PurchaseItem[];
}

const UserPurchases: React.FC = () => {
  const { getUserPurchases } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    const result = await getUserPurchases();
    
    if (result.success && result.purchases) {
      setPurchases(result.purchases);
      setError(null);
    } else {
      setError(result.error || 'Ett fel uppstod vid hämtning av köphistorik');
    }
    
    setLoading(false);
  };

  // Formatera datum till läsbart format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('sv-SE', options);
  };

  // Formatera pris till SEK
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', { 
      style: 'currency', 
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Din köphistorik</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchPurchases}
          className="px-4 py-2 rounded bg-pink-400 hover:bg-pink-500 text-white">
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Din köphistorik</h2>
      
      {purchases.length === 0 ? (
        <p className="text-gray-600">Du har inte gjort några köp än.</p>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div 
              key={purchase.purchaseId} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Ordernummer: #{purchase.purchaseId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Datum: {formatDate(purchase.purchaseDate)}
                  </p>
                </div>
                <p className="font-semibold text-lg mt-2 md:mt-0">
                  {formatPrice(purchase.price)}
                </p>
              </div>
              
              <div className="mt-3 border-t pt-3">
                <p className="font-medium mb-2">Produkter:</p>
                <ul className="space-y-2">
                  {purchase.items.map((item) => (
                    <li key={item.itemId} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.productDescription}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPurchases;