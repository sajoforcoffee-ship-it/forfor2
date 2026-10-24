import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/useStore';

interface CartPageProps {
  onShop: () => void;
}

const money = (value: number) => `${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;

export default function CartPage({ onShop }: CartPageProps) {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useStore();
  const shippingThreshold = 1500;
  const shippingFee = cartTotal > 0 && cartTotal < shippingThreshold ? 79 : 0;
  const total = cartTotal + shippingFee;
  const remaining = Math.max(0, shippingThreshold - cartTotal);

  if (!cart.length) {
    return (
      <main className="cart-page cart-empty-page">
        <div className="cart-empty-state">
          <ShoppingBag size={42} strokeWidth={1.2} />
          <span className="eyebrow">FOR COFFEE</span>
          <h1>Sepetiniz henüz boş.</h1>
          <p>Size özel kahve koleksiyonumuzu keşfedin ve favorilerinizi sepetinize ekleyin.</p>
          <button type="button" className="btn-primary" onClick={onShop}>Kahveleri Keşfet <ArrowLeft size={16} className="rotate-180" /></button>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-shell">
        <div className="cart-heading"><span className="eyebrow">FOR COFFEE / SEPET</span><h1>Seçimleriniz.</h1><p>{cartCount} ürün özenle sizin için hazırlanıyor.</p></div>
        <div className="cart-layout">
          <section className="cart-items" aria-label="Sepet ürünleri">
            {cart.map((item) => (
              <article className="cart-line" key={item.key}>
                <img src={item.image} alt={`${item.name} ürün görseli`} />
                <div className="cart-line-info"><span className="eyebrow">{item.weight} / {item.grind}</span><h2>{item.name}</h2><strong>{money(item.price)}</strong></div>
                <div className="cart-line-actions">
                  <div className="quantity" aria-label={`${item.name} miktarı`}><button type="button" aria-label="Miktarı azalt" onClick={() => item.quantity > 1 ? updateQuantity(item.key, item.quantity - 1) : removeFromCart(item.key)}><Minus size={15} /></button><strong>{item.quantity}</strong><button type="button" aria-label="Miktarı artır" onClick={() => updateQuantity(item.key, Math.min(99, item.quantity + 1))}><Plus size={15} /></button></div>
                  <strong className="cart-line-total">{money(item.price * item.quantity)}</strong>
                  <button type="button" className="cart-remove" aria-label={`${item.name} ürününü kaldır`} onClick={() => removeFromCart(item.key)}><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
            <button type="button" className="cart-clear" onClick={() => { if (window.confirm('Sepetinizdeki tüm ürünler kaldırılsın mı?')) clearCart(); }}>Sepeti temizle</button>
          </section>
          <aside className="cart-summary">
            <span className="eyebrow">Sipariş özeti</span><h2>Toplamınız</h2>
            <div className="cart-summary-row"><span>Ürünler ara toplamı</span><strong>{money(cartTotal)}</strong></div>
            <div className="cart-summary-row"><span>Kargo <small>Tahmini</small></span><strong>{shippingFee ? money(shippingFee) : 'Ücretsiz'}</strong></div>
            <div className={`shipping-message ${remaining ? '' : 'is-free'}`}>{remaining ? `Ücretsiz kargoya ulaşmak için ${money(remaining)} daha ekleyin.` : 'Ücretsiz kargo kazandınız.'}</div>
            <div className="cart-total-row"><span>Genel toplam</span><strong>{money(total)}</strong></div>
            <button type="button" className="btn-primary cart-checkout" onClick={() => window.location.href = 'https://www.forcoffeetr.com/magaza/odeme/'}>Ödemeye Geç <ArrowLeft size={17} className="rotate-180" /></button>
            <button type="button" className="cart-continue" onClick={onShop}>Alışverişe devam et</button>
            <p className="cart-secure">Güvenli ödeme · Taze kavrum · 2–3 gün teslimat</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
