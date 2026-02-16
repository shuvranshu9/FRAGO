import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { theme } from "../../styles/theme";

const ContactInfo = () => {
  const infoItems = [
    {
      icon: <MapPin size={24} />,
      title: "Our Boutique",
      content: "123 Fragrance Lane, Scent District, NY 10001",
    },
    {
      icon: <Phone size={24} />,
      title: "Call Us",
      content: "+1 (555) 000-FRAGO",
    },
    {
      icon: <Mail size={24} />,
      title: "Email Us",
      content: "concierge@frago.com",
    },
    {
      icon: <Clock size={24} />,
      title: "Opening Hours",
      content: "Mon - Sat: 10am - 8pm | Sun: 11am - 6pm",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
      {infoItems.map((item, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div
            className="p-3 rounded-sm"
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.primary,
            }}
          >
            {item.icon}
          </div>
          <div>
            <h3
              className="text-lg font-serif mb-1"
              style={{
                fontFamily: theme.fonts.heading,
                color: theme.colors.text.primary,
              }}
            >
              {item.title}
            </h3>
            <p className="text-sm font-light text-gray-600 leading-relaxed">
              {item.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfo;
