import { useState, useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnnouncementBar } from './components/AnnouncementBar';
// import { PanchangBar } from './components/PanchangBar';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { VideoSection } from './components/VideoSection';
import { CategoryCards } from './components/CategoryCards';
import { PromoBlocksSection } from './components/PromoBlocksSection';
import { ProductGrid } from './components/ProductGrid';
import { CategoryGrid } from './components/CategoryGrid';
import { TrustBadges } from './components/TrustBadges';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './components/LoginPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CategoryPage } from './components/CategoryPage';
import { ProductDetailPage } from './components/ProductDetailPage';
// import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';
import { OrdersPage } from './components/OrdersPage';
import { UserProfile } from './components/UserProfile';
import { AboutPage } from './components/AboutPage';
import { FestivalPage } from './components/FestivalPage';
// import { FAQSection } from './components/FAQSection';
import { ReviewsSection } from './components/ReviewsSection';
import { NewsletterSection } from './components/NewsletterSection';
import { MaintenanceMode } from './components/MaintenanceMode';
import { LegalPage } from './components/LegalPage';

function AppContent() {
  const { settings } = useSettings();
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fullHash = window.location.hash || '#/';
    const secondHashIndex = fullHash.indexOf('#', 1);
    if (secondHashIndex === -1) return;

    const anchor = fullHash.slice(secondHashIndex + 1).trim();
    if (!anchor) return;

    const timeout = setTimeout(() => {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [currentPath]);

  const renderBestSellersPage = () => (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <ProductGrid title="Best Sellers" filter="bestseller" />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );

  const renderAstroPujaBookingPage = () => (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <PromoBlocksSection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );

  const renderCategoriesPage = () => (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryGrid />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );

  // Check maintenance mode (allow admin access)
  if (settings?.maintenanceMode && !currentPath.includes('/admin') && currentPath !== '#/' && currentPath !== '#/admin') {
    return <MaintenanceMode />;
  }

  const renderPage = () => {
    // Get path without hash fragment
    const fullPath = currentPath.slice(1);
    const path = fullPath.split('?')[0].split('#')[0];

    if (path === '/admin') {
      return <AdminLayout onClose={() => {
        window.location.hash = '#/';
        setCurrentPath('#/');
      }} />;
    }

    if (path === '/login') {
      return <LoginPage />;
    }

    if (path === '/checkout') {
      return <CheckoutPage />;
    }

    // if (path === '/faq') {
    //   return <FAQPage />;
    // }

    if (path === '/contact') {
      return <ContactPage />;
    }

    if (path === '/orders') {
      return <OrdersPage />;
    }

    if (path === '/profile') {
      return <UserProfile />;
    }

    if (path === '/about' || path.startsWith('/about')) {
      return <AboutPage />;
    }

    if (path === '/terms') {
      return <LegalPage page="terms" />;
    }

    if (path === '/privacy') {
      return <LegalPage page="privacy" />;
    }

    if (path === '/refund-cancellation') {
      return <LegalPage page="refund" />;
    }

    if (path.startsWith('/category/')) {
      const categorySlug = path.split('/')[2];
      return <CategoryPage categorySlug={categorySlug} />;
    }

    if (path.startsWith('/product/')) {
      const productSlug = path.split('/')[2];
      return <ProductDetailPage productSlug={productSlug} />;
   
 
    }

    if (path.startsWith('/festival/')) {
      const festivalSlug = path.split('/')[2];
      return <FestivalPage festivalSlug={festivalSlug} />;
    }

    if (path === '/bestsellers') {
      return renderBestSellersPage();
    }

    if (path === '/astro-puja-booking') {
      return renderAstroPujaBookingPage();
    }

    if (path === '/categories') {
      return renderCategoriesPage();
    }

    if (path.startsWith('/shop/') || path === '/products') {
      return <CategoryPage />;
    }

    return (
      <>
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />

        <main>
          <HeroCarousel />
        
          {/* <div className="text-center py-8">
            <p className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A]">
              • Cherish Every Ritual, With <span className="text-[#FF8C00]">Care & Value</span> •
            </p>
          </div> */}
          <CategoryCards />
          <PromoBlocksSection />
          <VideoSection />
          {/* <ProductGrid title="Featured" filter="featured" /> */}
          {/* <FestiveSection /> */}
          <TrustBadges />
          <ReviewsSection />
          {/* <FAQSection /> */}
          <NewsletterSection />
        </main>

        <Footer />
        <CartDrawer />
      </>
    );
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        {renderPage()}
      </div>
    </CartProvider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </SettingsProvider>
  );
}

export default App;
