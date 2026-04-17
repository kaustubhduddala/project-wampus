import { useEffect, useState } from "react";
import { ShoppingBag, Package, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { getStoreItems, type ShopItemCard } from "@/api/publicApi";
import { getDonationUrl, openExternalUrl } from "@/config/externalLinks";
import { useCart } from "@/state/cart";

export default function Shop() {
  const { addItem, totalItems } = useCart();
  const [items, setItems] = useState<ShopItemCard[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      setLoadingItems(true);
      setItemsError(null);

      try {
        const payload = await getStoreItems();
        if (mounted) {
          setItems(payload);
        }
      } catch (error) {
        if (mounted) {
          setItems([]);
          setItemsError(error instanceof Error ? error.message : "Failed to load store items");
        }
      } finally {
        if (mounted) {
          setLoadingItems(false);
        }
      }
    };

    loadItems();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = (item: ShopItemCard) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
    setLastAddedItemId(item.id);
    window.setTimeout(() => {
      setLastAddedItemId((current) => (current === item.id ? null : current));
    }, 1200);
  };

  const handleDonate = (amount?: number) => {
    openExternalUrl(getDonationUrl(amount), "Donation");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-6xl font-black mb-6">SHOP FOR A CAUSE</h1>
          <p className="text-2xl font-bold text-black max-w-3xl mx-auto">
            Every purchase supports our mission to end homelessness in Austin
          </p>
        </div>
      </section>

      {/* Impact Message */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-black text-white neo-brutal-border neo-brutal-shadow p-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-[#22C55E]" />
          <p className="text-xl font-black">
            100% of proceeds go directly to feeding people experiencing homelessness
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-black mb-8">MERCHANDISE</h2>
        {totalItems > 0 && (
          <p className="font-bold mb-6">Cart items: {totalItems}</p>
        )}

        {loadingItems && (
          <div className="bg-white neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold">Loading merchandise...</p>
          </div>
        )}
        {itemsError && (
          <div className="bg-yellow-100 neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold text-yellow-800">Could not load merchandise: {itemsError}</p>
          </div>
        )}
        
        {items.length === 0 ? (
          <div className="bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="font-black text-xl mb-2">NO ITEMS AVAILABLE</p>
            <p className="font-bold text-gray-600">Inventory has not been published yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item.id} className="bg-white neo-brutal-border neo-brutal-shadow overflow-hidden">
                <div className="aspect-square bg-[#F5F5F5] neo-brutal-border-thin border-b flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-black">{item.name}</h3>
                    {!item.in_stock && (
                      <Badge className="bg-red-500 text-white neo-brutal-border-thin font-black">
                        OUT OF STOCK
                      </Badge>
                    )}
                  </div>
                  <p className="font-bold mb-4 text-sm">{item.description}</p>
                  {item.sizes_available && item.sizes_available.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold mb-2">SIZES:</p>
                      <div className="flex gap-2">
                        {item.sizes_available.map((size, idx) => (
                          <div key={idx} className="w-8 h-8 neo-brutal-border-thin flex items-center justify-center">
                            <span className="text-xs font-black">{size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black">${item.price}</span>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.in_stock}
                      className="neo-button bg-[#22C55E] text-white font-black"
                    >
                      {lastAddedItemId === item.id ? "ADDED" : "ADD TO CART"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Donate Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-[#22C55E] neo-brutal-border neo-brutal-shadow p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-6">PREFER TO DONATE DIRECTLY?</h2>
            <p className="text-xl font-bold text-black mb-8">
              Skip the merch and make a direct impact today
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button type="button" onClick={() => handleDonate(25)} className="neo-button bg-white text-black p-6">
                <p className="text-3xl font-black mb-2">$25</p>
                <p className="text-xs font-bold">5 Meals</p>
              </button>
              <button type="button" onClick={() => handleDonate(50)} className="neo-button bg-white text-black p-6">
                <p className="text-3xl font-black mb-2">$50</p>
                <p className="text-xs font-bold">10 Meals</p>
              </button>
              <button type="button" onClick={() => handleDonate(100)} className="neo-button bg-white text-black p-6">
                <p className="text-3xl font-black mb-2">$100</p>
                <p className="text-xs font-bold">20 Meals</p>
              </button>
            </div>
            <Button onClick={() => handleDonate()} className="neo-button bg-black! text-white px-8 py-6 text-lg font-black">
              CUSTOM AMOUNT
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
