import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Phone, User, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  relation: string | null;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone_number: "",
    relation: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("emergency_contacts")
        .insert([
          {
            user_id: user.id,
            name: newContact.name,
            phone_number: newContact.phone_number,
            relation: newContact.relation || null,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Contact added",
        description: `${newContact.name} has been added to your emergency contacts.`,
      });

      setNewContact({ name: "", phone_number: "", relation: "" });
      setIsDialogOpen(false);
      fetchContacts();
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Contact removed",
        description: "Emergency contact has been removed.",
      });

      fetchContacts();
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-pink-dark p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Emergency Contacts</h1>
            <p className="text-sm text-muted-foreground">Manage your trusted contacts</p>
          </div>
        </div>

        {/* Add Contact Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-she-pink via-she-purple to-she-blue hover:opacity-90 transition-opacity rounded-full py-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Emergency Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Contact name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    required
                    className="glass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newContact.phone_number}
                    onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
                    required
                    className="glass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relation">Relation (Optional)</Label>
                  <Input
                    id="relation"
                    placeholder="e.g., Mother, Friend"
                    value={newContact.relation}
                    onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                    className="glass"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Contact
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contacts List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No emergency contacts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add contacts to receive SOS alerts
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">{contact.name}</h3>
                    </div>
                    {contact.relation && (
                      <p className="text-sm text-muted-foreground mb-2">{contact.relation}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3" />
                      <span>{contact.phone_number}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Card */}
        <div className="glass rounded-2xl p-6 mt-6">
          <h3 className="font-semibold mb-2">How it works</h3>
          <p className="text-sm text-muted-foreground">
            When you activate SOS, these contacts will receive your live location and emergency details instantly via SMS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
