import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function Deliveries() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    volunteer_name: "",
    meals_delivered: "",
    latitude: "",
    longitude: "",
    address: "",
    notes: "",
    photo_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => base44.entities.Delivery.list("-created_date"),
    initialData: [],
  });

  const createDeliveryMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Delivery.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      setShowForm(false);
      setFormData({
        volunteer_name: "",
        meals_delivered: "",
        latitude: "",
        longitude: "",
        address: "",
        notes: "",
        photo_url: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeliveryMutation.mutate({
      ...formData,
      meals_delivered: parseInt(formData.meals_delivered),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo_url: file_url });
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  };

  const totalMeals = deliveries.reduce((sum, d) => sum + (d.meals_delivered || 0), 0);

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-black text-[#22C55E]">{totalMeals}</p>
              <p className="text-sm font-bold">TOTAL MEALS</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#22C55E]">{deliveries.length}</p>
              <p className="text-sm font-bold">DELIVERIES</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#22C55E]">
                {new Set(deliveries.map(d => d.volunteer_name)).size}
              </p>
              <p className="text-sm font-bold">VOLUNTEERS</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#22C55E]">
                {deliveries.length > 0 ? (totalMeals / deliveries.length).toFixed(1) : 0}
              </p>
              <p className="text-sm font-bold">AVG MEALS/DELIVERY</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Log New Delivery Button */}
        {!showForm && (
          <div className="mb-8">
            <Button
              onClick={() => setShowForm(true)}
              className="neo-button bg-[#22C55E] text-white text-lg px-8 py-6 font-black"
            >
              <Plus className="w-5 h-5 mr-2" />
              LOG NEW DELIVERY
            </Button>
          </div>
        )}

        {/* Delivery Form */}
        {showForm && (
          <Card className="neo-brutal-border neo-brutal-shadow mb-8">
            <CardHeader className="bg-[#22C55E]">
              <CardTitle className="font-black text-2xl text-white">NEW DELIVERY LOG</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-black mb-2">VOLUNTEER NAME*</label>
                    <Input
                      required
                      value={formData.volunteer_name}
                      onChange={(e) => setFormData({ ...formData, volunteer_name: e.target.value })}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2">MEALS DELIVERED*</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      value={formData.meals_delivered}
                      onChange={(e) => setFormData({ ...formData, meals_delivered: e.target.value })}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Number of meals"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black mb-2">LOCATION*</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      required
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Latitude"
                    />
                    <Input
                      required
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Longitude"
                    />
                    <Button
                      type="button"
                      onClick={getLocation}
                      className="neo-button bg-black text-white font-black"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      GET LOCATION
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block font-black mb-2">ADDRESS/LANDMARK</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Street address or nearby landmark"
                  />
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
                  <label className="block font-black mb-2">PHOTO (OPTIONAL)</label>
                  <div className="flex gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="neo-brutal-border-thin font-bold"
                      disabled={uploading}
                    />
                    {uploading && <p className="font-bold">Uploading...</p>}
                    {formData.photo_url && <Check className="w-6 h-6 text-[#22C55E]" />}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createDeliveryMutation.isPending}
                    className="neo-button bg-[#22C55E] text-white font-black px-8"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    LOG DELIVERY
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
        {deliveries.length === 0 ? (
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
                    <CardTitle className="font-black text-lg">{delivery.volunteer_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#22C55E] neo-brutal-border-thin flex items-center justify-center">
                        <span className="font-black text-white">{delivery.meals_delivered}</span>
                      </div>
                      <span className="text-sm font-bold">meals</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-[#22C55E]" />
                      <div>
                        <p className="font-bold text-sm">
                          {delivery.latitude}, {delivery.longitude}
                        </p>
                        {delivery.address && (
                          <p className="text-xs font-bold text-gray-600">{delivery.address}</p>
                        )}
                      </div>
                    </div>
                    {delivery.notes && (
                      <p className="text-sm font-bold bg-[#F5F5F5] p-3 neo-brutal-border-thin">
                        {delivery.notes}
                      </p>
                    )}
                    {delivery.photo_url && (
                      <img
                        src={delivery.photo_url}
                        alt="Delivery"
                        className="w-full neo-brutal-border-thin"
                      />
                    )}
                    <p className="text-xs font-bold text-gray-600">
                      {format(new Date(delivery.created_date), "MMM d, yyyy 'at' h:mm a")}
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
