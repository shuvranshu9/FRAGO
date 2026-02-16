import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { theme } from "../../styles/theme";

const ContactInfo = () => {
  const infoItems = [
    {
      icon: <MapPin size={24} />,
      title: "Our Location",
      content: "Kathmandu, Nepal",
    },
    {
      icon: <Phone size={24} />,
      title: "Call Us",
      content: "+977-981234567",
    },
    {
      icon: <Mail size={24} />,
      title: "Email Us",
      content: "teamfrago@gmail.com",
    },
    {
      icon: <Clock size={24} />,
      title: "Opening Hours",
      content: "Mon - Sat: 10am - 8pm <br/> Sun: 11am - 6pm",
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
            <p
              className="text-sm font-light text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfo;
