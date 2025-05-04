import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from './AuthContext';

// Type definitions
interface StripeCheckoutButtonProps {
  productLookupKey: string;
  buttonText?: string;
  mode?: 'subscription' | 'payment';
  productType?: 'course' | 'template' | 'subscription';
  productId?: number;
  guestEmail?: string;
}

interface StripePortalButtonProps {
  sessionId: string;
  buttonText?: string;
}

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  lookupKey: string;
}

interface CourseCardProps {
  id: number;
  title: string;
  price: string;
  description: string;
  buttonText?: string;
}

interface TemplateCardProps {
  id: number;
  title: string;
  price: string;
  description: string;
  buttonText?: string;
}

interface CheckIconProps {
  className?: string;
}

interface CheckoutResponse {
  url?: string;
  checkoutUrl?: string;
  CheckoutUrl?: string;
  guestPurchaseId?: number;
}

/**
 * Universal Stripe Checkout Button that handles all payment types
 */
const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({ 
  productLookupKey, 
  buttonText = "Köp nu", 
  mode = "payment",
  productType = "subscription",
  productId,
  guestEmail
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const handleCheckout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    // Check if user is authenticated for subscription or course purchases
    if ((productType === 'subscription' || productType === 'course') && !auth.isAuthenticated) {
      setError('Vänligen logga in för att genomföra köpet');
      setLoading(false);
      return;
    }

    // For template purchases by guests, ensure email is provided
    if (productType === 'template' && !auth.isAuthenticated && !guestEmail) {
      setError('E-postadress krävs för gästköp');
      setLoading(false);
      return;
    }
    
    try {
      let response;
      
      // Different endpoints based on product type
      switch (productType) {
        case 'course':
          // Course purchase endpoint (requires auth)
          response = await api.post(`/api/purchase/course?courseId=${productId}`, {});
          break;
          
        case 'template':
          if (!auth.isAuthenticated && guestEmail) {
            // Guest template purchase
            response = await api.post('/api/guestpurchase/payment', {
              guestEmail: guestEmail,
              templateId_Fk: productId
            });
          } else {
            // Logged in user template purchase (uses standard checkout)
            response = await api.post('/api/payments/create-checkout-session', {
              lookupKey: productLookupKey,
              mode: mode
            });
          }
          break;
          
        case 'subscription':
          // Subscription purchase endpoint
          response = await api.post('/api/subscribe', {});
          break;
          
        default:
          // Fallback to generic checkout for backward compatibility
          response = await api.post('/api/payments/create-checkout-session', {
            lookupKey: productLookupKey,
            mode: mode
          });
      }
      
      const data: CheckoutResponse = response.data as CheckoutResponse;
      
      // Different endpoints return different properties
      const redirectUrl = data.url || data.checkoutUrl || data.CheckoutUrl;
      
      if (!redirectUrl) {
        throw new Error('Ingen betalnings-URL returnerades från servern');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('Error during checkout:', err);
      
      // Handle different types of axios errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = err.response.status;
        const errorData = err.response.data;
        
        if (statusCode === 401) {
          setError('Vänligen logga in för att fortsätta');
        } else if (statusCode === 404) {
          setError('Tjänsten är inte tillgänglig. Vänligen försök igen senare.');
        } else {
          setError(errorData?.error || `Fel: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Kunde inte nå servern. Kontrollera din internetanslutning.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'Kunde inte starta betalningen. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-4 w-full">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700 mb-4">
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
            Bearbetar...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

// Stripe Portal button using axios
const StripePortalButton: React.FC<StripePortalButtonProps> = ({ 
  sessionId, 
  buttonText = "Hantera prenumeration" 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const handlePortalAccess = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    // Check if user is authenticated
    if (!auth.isAuthenticated) {
      setError('Vänligen logga in för att hantera din prenumeration');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/api/payments/create-portal-session', {
        sessionId: sessionId
      });
      
      const data = response.data as { url?: string };
      
      if (!data.url) {
        throw new Error('Ingen portal-URL returnerades från servern');
      }
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error accessing portal:', err);
      
      // Handle different types of axios errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = err.response.status;
        const errorData = err.response.data;
        
        if (statusCode === 401) {
          setError('Vänligen logga in för att fortsätta');
        } else if (statusCode === 404) {
          setError('Tjänsten är inte tillgänglig. Vänligen försök igen senare.');
        } else {
          setError(errorData?.error || `Fel: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Kunde inte nå servern. Kontrollera din internetanslutning.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'Kunde inte öppna portalen. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-4 w-full">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700 mb-4">
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <button
        onClick={handlePortalAccess}
        disabled={loading}
        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
            Bearbetar...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

const CheckIcon: React.FC<CheckIconProps> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  title, 
  price, 
  description, 
  features, 
  lookupKey 
}) => {
  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow w-full max-w-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="text-3xl font-bold mb-1">{price}</div>
        <div className="text-sm text-gray-500">per månad</div>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <ul className="mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center mb-2">
            <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <StripeCheckoutButton 
        productLookupKey={lookupKey} 
        productType="subscription" 
        buttonText="Prenumerera nu"
        mode="subscription"
      />
    </div>
  );
};

// Course card component
const CourseCard: React.FC<CourseCardProps> = ({ 
  id, 
  title, 
  price, 
  description, 
  buttonText = "Köp kurs"
}) => {
  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow w-full max-w-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="text-3xl font-bold mb-1">{price}</div>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <StripeCheckoutButton 
        productLookupKey={`course_${id}`}
        productId={id}
        productType="course"
        buttonText={buttonText}
      />
    </div>
  );
};

// Guest Template Purchase component with email input
const GuestTemplatePurchase: React.FC<TemplateCardProps> = ({ 
  id, 
  title, 
  price, 
  description, 
  buttonText = "Köp mall" 
}) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const auth = useAuth();
  
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(null);
  };

  
  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow w-full max-w-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="text-3xl font-bold mb-1">{price}</div>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      {/* Only show email input for non-authenticated users */}
      {!auth.isAuthenticated && (
        <div className="mb-4">
          <label htmlFor={`guest-email-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
            E-post (för att ta emot mallen)
          </label>
          <input
            type="email"
            id={`guest-email-${id}`}
            value={email}
            onChange={handleEmailChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="dinmail@exempel.se"
            onBlur={() => {
              if (email && !validateEmail(email)) {
                setEmailError("Ogiltig e-postadress format");
              }
            }}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>
      )}
      
      <StripeCheckoutButton 
        productLookupKey={`template_${id}`}
        productId={id}
        productType="template"
        buttonText={buttonText}
        guestEmail={email}
      />
    </div>
  );
};

// Combined page for all products
const CombinedProductsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  
  // Get the session ID from URL if user just completed checkout
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const success = urlParams.get('success');
  const purchaseType = urlParams.get('purchase_type');
  
  // Testing API connection
  const testApiConnection = async () => {
    try {
      setIsPageLoading(true);
      const response = await api.get('/api/test');
      console.log('API connection test successful:', response.data);
      alert('API connection successful: ' + JSON.stringify(response.data));
    } catch (error: any) {
      console.error('API connection test failed:', error);
      let errorMessage = 'API connection failed';
      
      if (error.response) {
        errorMessage += `: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage += ': No response received from server';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsPageLoading(false);
    }
  };
  
  useEffect(() => {
    // Check URL params and scroll to the appropriate section if needed
    if (success === 'true' && purchaseType) {
      const section = document.getElementById(purchaseType);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [success, purchaseType]);
  
  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      {!isAuthenticated && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
          <h2 className="text-xl font-bold mb-2">Vänligen logga in</h2>
          <p>För att få tillgång till alla funktioner och fördelar, logga in eller skapa ett konto.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Logga in
          </button>
        </div>
      )}
      
      {/* Developer Testing Tools (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-8 bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">Utvecklarverktyg</h2>
          <div className="flex space-x-4">
            <button 
              onClick={testApiConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Testa API-anslutning
            </button>
          </div>
        </div>
      )}
      
      {success === 'true' && sessionId && (
        <div className="mb-8 bg-green-50 border border-green-200 p-4 rounded-md text-green-700">
          <h2 className="text-xl font-bold mb-2">Betalning genomförd!</h2>
          <p className="mb-4">Tack för ditt köp. Din beställning har behandlats.</p>
          {/* Only show portal button for subscriptions */}
          {purchaseType === 'subscription' && (
            <StripePortalButton sessionId={sessionId} />
          )}
        </div>
      )}
      
      {/* Subscriptions Section */}
      <section id="subscription" className="mb-20">
        <h1 className="text-4xl font-bold mb-8 text-center">Prenumerationsplaner</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SubscriptionCard 
            title="Bas" 
            price="99 kr" 
            description="Perfekt för dig som vill komma igång" 
            features={[
              "Tillgång till grundkurser",
              "Begränsad malltillgång",
              "E-postsupport"
            ]}
            lookupKey="basic_monthly"
          />
          
          <SubscriptionCard 
            title="Professionell" 
            price="199 kr" 
            description="Utmärkt för yrkesverksamma och små team" 
            features={[
              "Tillgång till alla kurser",
              "Obegränsad malltillgång",
              "Prioriterad e-postsupport",
              "Intyg för avklarade kurser"
            ]}
            lookupKey="pro_monthly"
          />
          
          <SubscriptionCard 
            title="Företag" 
            price="499 kr" 
            description="För organisationer med avancerade behov" 
            features={[
              "Allt i Professionell",
              "Anpassat varumärke",
              "API-tillgång",
              "Dedikerad support",
              "Teamhantering"
            ]}
            lookupKey="enterprise_monthly"
          />
        </div>
      </section>
      
      {/* Courses Section */}
      <section id="course" className="mb-20">
        <h2 className="text-4xl font-bold mb-8 text-center">Våra kurser</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CourseCard 
            id={1}
            title="Introduktion till karriärutveckling" 
            price="299 kr" 
            description="Lär dig grunderna i modern karriärutveckling"
          />
          
          <CourseCard 
            id={2}
            title="CV-optimering" 
            price="199 kr" 
            description="Skapa ett CV som sticker ut i mängden"
          />
          
          <CourseCard 
            id={3}
            title="Intervjuteknik" 
            price="249 kr" 
            description="Förbered dig för framgångsrika jobbintervjuer"
          />
        </div>
      </section>
      
      {/* Templates Section */}
      <section id="template" className="mb-8">
        <h2 className="text-4xl font-bold mb-8 text-center">Våra mallar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GuestTemplatePurchase 
            id={1}
            title="CV mall för utvecklare" 
            price="59.99 kr" 
            description="En professionell CV-mall anpassad för utvecklare och programmerare."
          />
          
          <GuestTemplatePurchase 
            id={2}
            title="Personligt brev" 
            price="79 kr" 
            description="Mall för övertygande personliga brev"
          />
          
          <GuestTemplatePurchase 
            id={3}
            title="LinkedIn-profil" 
            price="129 kr" 
            description="Optimera din LinkedIn-profil med denna mall"
          />
        </div>
      </section>
    </div>
  );
};

export default CombinedProductsPage;