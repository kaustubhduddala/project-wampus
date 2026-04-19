import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { format } from "date-fns";
import {
  AUTH_CHANGED_EVENT,
  createDelivery,
  getDeliveries,
  getStoredAuthToken,
  type DeliveryLog,
} from "@/api/publicApi";

export default function Deliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredAuthToken()));
  const [formData, setFormData] = useState({
    lat: "",
    lng: "",
    notes: "",
    itemsCsv: "",
  });

  useEffect(() => {
    const syncAuth = () => {
      const hasAuth = Boolean(getStoredAuthToken());
      setIsAuthenticated(hasAuth);
      if (!hasAuth) {
        setShowForm(false);
      }
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
    };
  }, []);

  const loadDeliveries = useCallback(async () => {
    setLoadingDeliveries(true);
    setDeliveriesError(null);

    try {
      const payload = await getDeliveries();
      setDeliveries(payload);
    } catch (error) {
      setDeliveries([]);
      setDeliveriesError(error instanceof Error ? error.message : "Failed to load deliveries");
    } finally {
      setLoadingDeliveries(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const lat = Number(formData.lat);
    const lng = Number(formData.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setSubmitError("Latitude and longitude must be valid numbers.");
      return;
    }

    const items = formData.itemsCsv
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await createDelivery({
        lat,
        lng,
        notes: formData.notes.trim() ? formData.notes.trim() : undefined,
        items,
      });

      setShowForm(false);
      setFormData({
        lat: "",
        lng: "",
        notes: "",
        itemsCsv: "",
      });
      await loadDeliveries();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create delivery log");
    } finally {
      setSubmitting(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  };

  const uniqueVolunteerCount = useMemo(() => {
    const keys = new Set(
      deliveries
        .map((delivery) => delivery.volunteer_email ?? delivery.user_id)
        .filter(Boolean)
    );
    return keys.size;
  }, [deliveries]);

  const totalTaggedItems = useMemo(
    () => deliveries.reduce((sum, delivery) => sum + (delivery.items?.length ?? 0), 0),
    [deliveries]
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-6xl font-black mb-6">DELIVERY TRACKER</h1>
          <p className="text-2xl font-bold text-black">
            Member portal for logging meal deliveries
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-black text-white py-8 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-black text-[#22C55E]">{deliveries.length}</p>
              <p className="text-sm font-bold">DELIVERIES</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#22C55E]">
                {uniqueVolunteerCount}
              </p>
              <p className="text-sm font-bold">VOLUNTEERS</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#22C55E]">{totalTaggedItems}</p>
              <p className="text-sm font-bold">TAGGED ITEMS</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Log New Delivery Button */}
        {deliveriesError && (
          <div className="bg-yellow-100 neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold text-yellow-800">Could not load deliveries: {deliveriesError}</p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-100 neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold text-yellow-900">You must be logged in to log deliveries.</p>
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="neo-button bg-black! text-white font-black mt-3"
            >
              GO TO LOGIN
            </Button>
          </div>
        )}

        {isAuthenticated && !showForm && (
          <div className="mb-8">
            <Button
              onClick={() => setShowForm(true)}
              className="neo-button bg-[#22C55E]! text-white text-lg px-8 py-6 font-black"
            >
              <Plus className="w-5 h-5 mr-2" />
              LOG NEW DELIVERY
            </Button>
          </div>
        ) }

        {/* Delivery Form */}

        {isAuthenticated && showForm && (
          <Card className="neo-brutal-border neo-brutal-shadow mb-8">
            <CardHeader className="bg-[#22C55E]">
              <CardTitle className="font-black text-2xl text-white">NEW DELIVERY LOG</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-black mb-2">LATITUDE*</label>
                    <Input
                      required
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2">LONGITUDE*</label>
                    <Input
                      required
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Longitude"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={getLocation}
                    className="neo-button bg-black! text-white font-black"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    USE CURRENT LOCATION
                  </Button>
                </div>

                <div>
                  <label className="block font-black mb-2">NOTES</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Additional details about the delivery..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">ITEM TAGS (OPTIONAL)</label>
                  <Input
                    value={formData.itemsCsv}
                    onChange={(e) => setFormData({ ...formData, itemsCsv: e.target.value })}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="meal-bag, water, socks"
                  />
                </div>

                {submitError && (
                  <div className="bg-red-100 neo-brutal-border-thin p-3">
                    <p className="font-bold text-red-700">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="neo-button bg-[#22C55E]! text-white font-black px-8"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {submitting ? "SAVING..." : "LOG DELIVERY"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="neo-button bg-white text-black font-black"
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Deliveries List */}
        <h2 className="text-3xl font-black mb-6">RECENT DELIVERIES</h2>
        {loadingDeliveries ? (
          <div className="bg-white neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold">Loading delivery logs...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="font-black text-xl mb-2">NO DELIVERIES YET</p>
            <p className="font-bold text-gray-600">Start logging deliveries to see them here</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="neo-brutal-border neo-brutal-shadow">
                <CardHeader className="bg-[#F5F5F5] neo-brutal-border-thin border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-black text-lg">
                      {delivery.volunteer_email ?? (delivery.user_id ? `User ${delivery.user_id.slice(0, 8)}` : "Unassigned volunteer")}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-[#22C55E]" />
                      <div>
                        <p className="font-bold text-sm">
                          {delivery.lat ?? "N/A"}, {delivery.lng ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    {delivery.items.length > 0 && (
                      <div className="text-xs font-bold bg-[#EEF6E8] p-3 neo-brutal-border-thin">
                        Items: {delivery.items.join(", ")}
                      </div>
                    )}
                    {delivery.notes && (
                      <p className="text-sm font-bold bg-[#F5F5F5] p-3 neo-brutal-border-thin">
                        {delivery.notes}
                      </p>
                    )}
                    <p className="text-xs font-bold text-gray-600">
                      {delivery.created_at
                        ? format(new Date(delivery.created_at), "MMM d, yyyy 'at' h:mm a")
                        : "Unknown timestamp"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
