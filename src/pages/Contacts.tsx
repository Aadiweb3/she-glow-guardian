import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Plus, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Contacts = () => {
  const contacts: any[] = [];

  return (
    <div className="min-h-screen p-6">
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
        <Button className="w-full mb-6 bg-gradient-to-r from-primary to-primary-purple glow-primary rounded-full py-6">
          <Plus className="w-5 h-5 mr-2" />
          Add Emergency Contact
        </Button>

        {/* Contacts List */}
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No contacts yet</h3>
              <p className="text-sm text-muted-foreground">
                Add emergency contacts who will receive alerts when you trigger SOS
              </p>
            </div>
          ) : (
            contacts.map((contact, index) => (
              <div key={index} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-purple rounded-full flex items-center justify-center">
                    <UserCircle className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{contact.name}</h3>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {contact.relation}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10">
                    <Phone className="w-5 h-5" />
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
            When you activate SOS, these contacts will receive your live location, 
            audio recording, and emergency details instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
