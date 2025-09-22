import { motion } from "framer-motion";

export default function ReviewQuestion({ formData, updateFormData, t }) {
  const formatGuestCount = (count) => {
    const counts = {
      "1-10": "1-10 gestir",
      "11-25": "11-25 gestir",
      "26-50": "26-50 gestir",
      "51-100": "51-100 gestir",
      ">100": "Yfir 100 gestir",
      unknown: "Óviss fjöldi",
    };
    return counts[count] || count;
  };

  const formatServices = (services) => {
    const serviceLabels = {
      food: "Matur",
      drinks: "Drykkir",
      eventManager: "Atriði/Veislustjóri",
    };
    return (
      services?.map((s) => serviceLabels[s] || s).join(", ") ||
      "Engin þjónusta valin"
    );
  };

  const formatRoomSetup = (setup) => {
    const setups = {
      seated: "Borð",
      standing: "Standandi",
      mixed: "50/50",
    };
    return setups[setup] || setup;
  };

  const formatTablecloth = (tablecloth) => {
    const cloths = {
      white: "Hvítir dúkar",
      black: "Svartir dúkar",
      own: "Eigin dúkar",
    };
    return cloths[tablecloth] || tablecloth;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Ekki valið";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("is-IS", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Yfirlit beiðninnar
      </h2>

      <div className="text-center mb-8">
        <p className="text-[#fefff5] font-light">
          Vinsamlegast farðu yfir upplýsingarnar áður en þú sendir beiðnina
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-600/30 rounded-xl p-6"
        >
          <h3 className="font-light text-[#fefff5] mb-4 flex items-center space-x-2">
            <span className="text-[#a77d3b]">👤</span>
            <span>Tengiliðaupplýsingar</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Nafn:</span>{" "}
              {formData.contact?.name}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Netfang:</span>{" "}
              {formData.contact?.email}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Sími:</span>{" "}
              {formData.contact?.phone}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Fyrsta skipti:</span>{" "}
              {formData.firstTime ? "Já" : "Nei"}
            </p>
          </div>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-600/30 rounded-xl p-6"
        >
          <h3 className="font-light text-[#fefff5] mb-4 flex items-center space-x-2">
            <span className="text-[#a77d3b]">🎯</span>
            <span>Þjónusta</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Valin þjónusta:</span>{" "}
              {formatServices(formData.services)}
            </p>
            {formData.food && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Matur:</span>{" "}
                {formData.food}
              </p>
            )}
            {formData.drinks && formData.drinks.length > 0 && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Drykkir:</span>{" "}
                {formData.drinks.join(", ")}
              </p>
            )}
            {formData.eventManager?.needed === true && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Veislustjóri:</span>{" "}
                {formData.eventManager?.contact?.name || "Já"}
              </p>
            )}
          </div>
        </motion.div>

        {/* Event Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-slate-600/30 rounded-xl p-6"
        >
          <h3 className="font-light text-[#fefff5] mb-4 flex items-center space-x-2">
            <span className="text-[#a77d3b]">🎉</span>
            <span>Viðburðarupplýsingar</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Gestir:</span>{" "}
              {formatGuestCount(formData.guestCount)}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Uppsetning:</span>{" "}
              {formatRoomSetup(formData.roomSetup)}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Dúkar:</span>{" "}
              {formatTablecloth(formData.tablecloth)}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Dagsetning:</span>{" "}
              {formatDateTime(formData.dateTime?.preferred)}
            </p>
          </div>
        </motion.div>

        {/* Notes */}
        {formData.notes && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-600/30 rounded-xl p-6"
          >
            <h3 className="font-light text-[#fefff5] mb-4 flex items-center space-x-2">
              <span className="text-[#a77d3b]">📝</span>
              <span>Athugasemdir</span>
            </h3>
            <p className="text-sm text-[#fefff5] font-light">
              {formData.notes}
            </p>
          </motion.div>
        )}

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-r from-[#a77d3b]/20 to-[#a77d3b]/10 border border-[#a77d3b]/30 rounded-xl text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-[#a77d3b] to-[#a77d3b]/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-[#fefff5]">✨</span>
          </div>
          <h3 className="font-light text-[#fefff5] mb-2">
            Tilbúið að senda beiðnina?
          </h3>
          <p className="text-sm text-[#fefff5] font-light">
            Við munum hafa samband við þig innan 24 klukkustunda til að ræða
            nánar um viðburðinn þinn.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
