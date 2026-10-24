import { useMemo, useState } from "react";
import { ArrowLeft, Bean, Check, Coffee, FlaskConical, Filter, Minus, Package, Plus, ShoppingBag, Snowflake } from "lucide-react";
import { products, type Product } from "./BestSellers";
import coffeeProducts from "../data/coffee-products.json";
import { useStore } from "../context/useStore";

const GRINDS = ["Çekirdek", "Espresso", "Moka Pot", "Filtre", "V60", "Chemex", "Cold Brew"];
const WEIGHTS = ["250 g", "500 g"];
const ROASTS = ["Açık", "Orta Açık", "Orta", "Orta Koyu", "Koyu"];
const GRIND_ICONS = [Bean, Coffee, FlaskConical, Filter, Filter, FlaskConical, Snowflake];

const recommendationDescriptions: Record<string, string> = {
  "Colombia Supremo": "Kolombiya’nın Huila bölgesinden gelen bu %100 Arabica kahvesi, karamel ve sütlü çikolata notalarıyla dengeli bir içim sunar. Orta gövdesi ve hafif meyvemsi karakteriyle filtre kahve ve espresso için ideal bir seçimdir.",
  "Ethiopian Sidamo": "Etiyopya’nın Sidamo bölgesinden gelen bu Arabica kahvesi, çiçeksi aromaları, narenciye notaları ve canlı asiditesiyle öne çıkar. Hafif-orta gövdesi sayesinde özellikle V60, Chemex ve diğer filtre demleme yöntemlerinde zarif bir fincan deneyimi sunar.",
  "Guatemala Antigua": "Guatemala’nın volkanik topraklarında yetişen Arabica çekirdeklerinden hazırlanan bu kahve, kakao, hafif baharat ve narenciye dokunuşlarıyla dengeli bir karaktere sahiptir. Temiz içimi ve orta gövdesiyle filtre kahveden espressoya kadar farklı demleme yöntemlerine uyum sağlar.",
  "Jamaica Blue Mountain": "Jamaika’nın yüksek rakımlı Blue Mountain bölgesinden gelen bu seçkin Arabica kahvesi, çiçeksi aromaları, narenciye canlılığı ve tatlı çikolata dokunuşlarıyla rafine bir içim sunar. Yumuşak karakteri ve dengeli asiditesiyle özellikle nitelikli filtre kahve deneyimini sevenler için özel bir seçenektir.",
  "Kenya AA": "Kenya’nın seçkin kahve bölgelerinden gelen bu Arabica kahvesi, kırmızı meyve notaları, şekerli tatlılığı ve canlı asiditesiyle dikkat çeker. Orta gövdesi ve belirgin aromatik yapısıyla V60, Chemex ve espresso demlemelerinde karakterli bir fincan sunar.",
  "Nicaragua Gold": "Nicaragua Gold, mevcut ürün listesindeki aromatik profil bilgilerine göre yasemin, narenciye, karamel ve fındık notalarıyla tanımlanmaktadır. Bu aromatik karakter, filtre kahve ve espresso gibi farklı demleme yöntemleri için değerlendirilebilir.",
  "Peru Papagayo Grade 1": "Peru’nun Papagayo bölgesinden gelen bu seçkin Arabica kahvesi, tatlılık, meyvemsi notalar, fındık ve vanilya dokunuşlarını bir araya getirir. Orta asiditesi ve zengin gövdesiyle dengeli bir içim sunarken Grade 1 kalite sınıfıyla öne çıkar.",
  "Sumatra Blue Batak": "Endonezya’nın Batak bölgesinden gelen %100 Arabica kahvesi, çikolata ve toprak notalarıyla yoğun ve karakterli bir içim sunar. Belirgin asiditesi ve güçlü gövdesiyle hem filtre kahve hem de espresso sevenler için farklı bir alternatif oluşturur.",
  "Uganda Bigusi": "Uganda’nın Bigusi bölgesinde yetişen Arabica çekirdeklerinden hazırlanan bu kahve, kakao ve bitter çikolata notalarını hafif narenciye dokunuşlarıyla buluşturur. Dengeli gövdesi, temiz bitişi ve orta kavrum profiliyle zengin ama rahat içimli bir kahve deneyimi sunar.",
  "Costa Rica Tarrazú": "Kosta Rika’nın Tarrazú bölgesinden gelen bu Arabica kahvesi, karamel, kahverengi şeker, sütlü çikolata ve narenciye notalarıyla dengeli bir içim sunar. Orta gövdesi ve parlak, tatlı asiditesiyle filtre kahve ve espresso için ideal bir seçimdir.",
  "Peru Ecoforest": "Kuzey Peru’nun Cajamarca bölgesindeki küçük üreticiler tarafından yetiştirilen bu Arabica kahvesi, yıkanmış işleme yöntemiyle hazırlanır. Sütlü çikolata, fındık, elma ve narenciye notaları; kremamsı gövdesi ve dengeli asiditesiyle uyumlu bir fincan oluşturur.",
  "Moka Pot Blend": "Moka pot demlemeye özel hazırlanan bu harman, Colombia Supremo, Guatemala Antigua ve Kenya AA çekirdeklerini bir araya getirir. Bitter kakao, karamel ve kavrulmuş fındık notaları; yoğun gövdesi ve kadifemsi karakteriyle espresso benzeri güçlü bir kahve deneyimi sunar.",
  "Special Espresso Blend": "Guatemala, Kolombiya ve Kosta Rika çekirdeklerinin birleşiminden oluşan bu %100 Arabica harmanı, çikolata, karamel ve hafif fındık notalarıyla öne çıkar. Dengeli gövdesi ve pürüzsüz içimiyle espresso bazlı içecekler için keyifli bir tercihtir.",
  "Special Filter Blend": "Özenle seçilmiş kahve çekirdeklerinden hazırlanan bu harman, kırmızı meyve, çikolata ve karamel notalarını dengeli bir profilde buluşturur. Yumuşak içimi ve orta gövdesiyle filtre kahve makineleri, V60, Chemex ve French Press için uygundur.",
  "Decaf Kafeinsiz Türk Kahvesi": "Türk kahvesine özel ince öğütümle hazırlanan bu kafeinsiz seçenek, geleneksel cezve kahvesi keyfini sürdürmek isteyenler için tasarlanmıştır. Swiss Water Process yöntemiyle kafeini azaltılan kahve, köpüklü ve aromatik bir Türk kahvesi deneyimi sunmayı amaçlar.",
  "Peru Organic Decaf": "Peru Organic Decaf, ürün listesindeki tadım notalarına göre kakao, hafif karamel ve kuruyemiş aromalarıyla tanımlanmaktadır. Düşük asidite ve temiz bitiş özellikleriyle yumuşak karakterli bir kahve seçeneği olarak sunulabilir.",
};

export default function ProductDetail({ product, onBack, onProductClick }: { product: Product; onBack: () => void; onProductClick?: (product: Product) => void }) {
  const { addToCart } = useStore();
  const [weight, setWeight] = useState(WEIGHTS[0]);
  const [grind, setGrind] = useState(GRINDS[0]);
  const [roast, setRoast] = useState(ROASTS[2]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const image = product.image ?? "";
  const basePrice = product.price ?? (product.title.toLowerCase().includes('peru')
    ? 1599
    : product.title.toLowerCase().includes('sumatra') || product.title.toLowerCase().includes('jamaica')
      ? 849
      : 759);
  const price = useMemo(() => weight === "500 g" ? ({ 759: 1459, 849: 1649, 1599: 2959 }[basePrice] ?? basePrice) : basePrice, [basePrice, weight]);

  const addProduct = () => {
    addToCart({ productId: product.id, name: product.title, image, price, weight, grind, permalink: product.url }, quantity);
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1400);
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-shell">
        <button type="button" className="product-back" onClick={onBack}><ArrowLeft size={16} /> Mağazaya dön</button>
        <div className="product-detail-grid">
          <div className="product-gallery"><img src={image} alt={`${product.title} ürün görseli`} width={1200} height={1500} /></div>
          <div className="product-detail-copy">
            <span className="eyebrow">{product.origin}</span>
            <h1>{product.title}</h1>
            <div className="product-six-info" aria-label="Ürün kısa bilgileri">
              <article><span className="eyebrow">Menşei</span><strong>{product.fullOrigin || product.origin}</strong></article>
              <article><span className="eyebrow">Kavrum</span><strong>{product.roastLevel || 'Orta'}</strong></article>
              <article><span className="eyebrow">Aroma</span><strong>{product.tastingNotes?.split('\n')[0]?.replace(/^Tat Notaları:\s*/, '') || product.flavorNotes}</strong></article>
              <article><span className="eyebrow">Gövde</span><strong>{product.tastingNotes?.match(/Gövde:\s*([^;\n]+)/i)?.[1] || 'Dengeli'}</strong></article>
              <article><span className="eyebrow">Demleme</span><strong>{product.brewing?.split('\n')[0]?.replace(/^•\s*/, '') || 'Filtre, V60 ve Espresso'}</strong></article>
              <article><span className="eyebrow">Paket</span><strong>250 g / 500 g · Valfli ambalaj</strong></article>
            </div>
            <div className="product-price">{price.toLocaleString("tr-TR")} ₺</div>
            <div className="product-option"><h2>Gramaj seçimi</h2><div className="option-row">{WEIGHTS.map((item) => <button key={item} type="button" className={weight === item ? "is-selected" : ""} onClick={() => setWeight(item)}><Package size={28} strokeWidth={1.7} />{item}</button>)}</div></div>
            <div className="product-option"><h2>Öğütme seçeneği</h2><div className="option-grid">{GRINDS.map((item, index) => { const Icon = GRIND_ICONS[index]; return <button key={item} type="button" className={grind === item ? "is-selected" : ""} onClick={() => setGrind(item)}><Icon size={28} strokeWidth={1.6} />{item}</button>; })}</div></div>
            <div className="product-option"><h2>Kavrum derecesi <span>{roast}</span></h2><div className="roast-row">{ROASTS.map((item) => <button key={item} type="button" aria-label={`${item} kavrum`} className={roast === item ? "is-selected" : ""} onClick={() => setRoast(item)}><i />{item}</button>)}</div></div>
            <div className="product-purchase"><div className="quantity"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div><button type="button" className={`add-product ${addedToCart ? 'is-added' : ''}`} onClick={addProduct} aria-live="polite"><ShoppingBag size={18} /> {addedToCart ? 'Sepete eklendi' : 'Sepete ekle'}</button></div>
            <div className="product-trust"><span><Check size={15} /> Taze kavrum</span><span><Check size={15} /> Güvenli ödeme</span><span><Check size={15} /> 2–3 gün teslimat</span></div>
          </div>
        </div>
        <section className="product-recommendations" aria-labelledby="recommended-products-title">
          <div className="product-info-heading"><span className="eyebrow">Size özel seçtik</span><h2 id="recommended-products-title">Tavsiye ürünler</h2></div>
          <div className="recommended-grid">{products.filter((item) => item.id !== product.id).slice(0, 3).map((item) => { const catalog = coffeeProducts.find((entry) => entry.name.toLowerCase() === item.title.toLowerCase()); return <button type="button" className="recommended-card" key={item.id} onClick={() => onProductClick?.(item)}><div className="recommended-card-media"><img src={catalog?.image || item.image || ''} alt={item.title} /></div><div className="recommended-card-copy"><span>{catalog?.origin || item.origin}</span><h3>{item.title}</h3><p>{recommendationDescriptions[item.title] || catalog?.description || item.flavorNotes || item.description || 'Kahveniz için özenle seçilmiş özel ürün.'}</p><small>Kampanya alanı</small></div></button>; })}</div>
        </section>
      </div>
    </main>
  );
}
