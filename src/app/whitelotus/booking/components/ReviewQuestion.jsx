import { motion } from "framer-motion";

export default function ReviewQuestion({ formData, updateFormData, t }) {
  const formatGuestCount = (count) => {
    const counts = {
      "undir-10": "Undir 10 gestir",
      "10-25": "10-25 gestir",
      "26-50": "26-50 gestir",
      "51-75": "51-75 gestir",
      "76-100": "76-100 gestir",
      "100+": "100+ gestir",
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
      seated: "Borð - allir fá sæti við borð",
      standing: "Standandi - enginn stólar eða borð",
      mixed: "50/50 - Bæði standandi og sitjandi í boði",
      lounge:
        "Lounge - 2 sófar og lágborð, nokkrir stólar og síðan opið dansgólf",
      presentation: "Kynning/Sýning - stólar í átt að sviði",
    };
    return setups[setup] || setup;
  };

  const formatTablecloth = (tableclothData) => {
    if (!tableclothData) return "Ekki valið";
    if (tableclothData.wantsToRentTablecloths === false) {
      return "Ekki leigja dúka";
    }
    if (tableclothData.wantsToRentTablecloths === true) {
      const color = tableclothData.tableclothColor === "white" 
        ? "Hvítir dúkar" 
        : tableclothData.tableclothColor === "black"
          ? "Svartir dúkar"
          : "";
      return color || "Ekki valið";
    }
    return "Ekki valið";
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

  const formatEventType = (type) => {
    // Event type is now a free text field, so just return it as-is
    return type || "Ekki valið";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Ekki valið";
    // If it's already a formatted time string (from text input), return as-is
    // Otherwise try to format it as a time
    if (timeString.includes(":") && timeString.length <= 5) {
      try {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("is-IS", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return timeString;
      }
    }
    return timeString;
  };

  const formatBarType = (barType) => {
    const types = {
      openBar:
        "Opinn Bar - Við skráum allt sem selst og þú færð rkn eftir veisluna",
      prePurchased: "Fyrirframkeypt - Veldu hvað þú villt bjóða upp á",
      peoplePayThemselves: "Fólk kaupir sér sjálft drykki á barnum",
    };
    return types[barType] || barType;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-20"
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Yfirlit bókunar
      </h2>

      <div className="text-center mb-8">
        <p className="text-[#fefff5] font-light">
          Vinsamlegast farðu yfir upplýsingarnar áður en þú staðfestir
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
            {formData.contact?.company && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Fyrirtæki / stofnun:</span>{" "}
                {formData.contact.company}
              </p>
            )}
            {formData.contact?.kennitala && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Kennitala:</span>{" "}
                {formData.contact.kennitala}
              </p>
            )}
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
            {formData.servicesComment && (
              <p className="text-[#fefff5]/80 font-light italic text-xs mt-2">
                💬 {formData.servicesComment}
              </p>
            )}
            {formData.food && (
              <>
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Matur:</span>{" "}
                  {formData.food}
                </p>
                {formData.foodComment && (
                  <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                    💬 {formData.foodComment}
                  </p>
                )}
              </>
            )}
            {formData.drinks?.barType && (
              <>
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Drykkir:</span>{" "}
                  {formatBarType(formData.drinks.barType)}
                </p>
                {formData.drinks.specialRequests && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">Séróskir:</span>{" "}
                    {formData.drinks.specialRequests}
                  </p>
                )}
                {formData.drinks.comment && (
                  <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                    💬 {formData.drinks.comment}
                  </p>
                )}
              </>
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
            <span>Upplýsingar</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Gestir:</span>{" "}
              {formatGuestCount(formData.guestCount)}
            </p>
            {formData.guestCountComment && (
              <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                💬 {formData.guestCountComment}
              </p>
            )}
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Uppsetning:</span>{" "}
              {formatRoomSetup(formData.roomSetup)}
            </p>
            {formData.roomSetupComment && (
              <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                💬 {formData.roomSetupComment}
              </p>
            )}
            {formData.tableclothData && (
              <>
                {formData.tableclothData.wantsToRentTablecloths !== undefined && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">Dúkar:</span>{" "}
                    {formatTablecloth(formData.tableclothData)}
                  </p>
                )}
                {formData.tableclothData.needsNapkins !== undefined && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">Servéttur:</span>{" "}
                    {formData.tableclothData.needsNapkins ? "Já" : "Nei"}
                  </p>
                )}
                {formData.tableclothData.needsCandles !== undefined && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">Kerti:</span>{" "}
                    {formData.tableclothData.needsCandles ? "Já" : "Nei"}
                  </p>
                )}
                {formData.tableclothData.decorationComments && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">
                      Athugasemdir um borðskreytingar:
                    </span>{" "}
                    {formData.tableclothData.decorationComments}
                  </p>
                )}
              </>
            )}
            {formData.eventType && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Tegund viðburðar:</span>{" "}
                {formatEventType(formData.eventType)}
              </p>
            )}
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">Dagsetning:</span>{" "}
              {formatDateTime(formData.dateTime?.preferred)}
            </p>
            {formData.dateTime?.startTime && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Byrjunartími:</span>{" "}
                {formatTime(formData.dateTime.startTime)}
              </p>
            )}
            {formData.dateTime?.endTime && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Endatími:</span>{" "}
                {formatTime(formData.dateTime.endTime)}
              </p>
            )}
            {formData.needsEarlyAccess !== undefined && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Aðgangur fyrr fyrir uppsetningu:</span>{" "}
                {formData.needsEarlyAccess ? "Já" : "Nei"}
              </p>
            )}
            {formData.setupTime && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">Uppsetningartími:</span>{" "}
                {formatTime(formData.setupTime)}
              </p>
            )}
            {formData.dateTimeComment && (
              <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                💬 {formData.dateTimeComment}
              </p>
            )}
          </div>
        </motion.div>

        {/* Tech and Music */}
        {formData.techAndMusic && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-600/30 rounded-xl p-6"
          >
            <h3 className="font-light text-[#fefff5] mb-4 flex items-center space-x-2">
              <span className="text-[#a77d3b]">🎵</span>
              <span>Tækni og tónlist</span>
            </h3>
            <div className="space-y-2 text-sm">
              {formData.techAndMusic.djOnSite !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">DJ á staðnum:</span>{" "}
                  {formData.techAndMusic.djOnSite === true
                    ? "Já"
                    : formData.techAndMusic.djOnSite === false
                      ? "Nei"
                      : "?"}
                </p>
              )}
              {formData.techAndMusic.djBringsOwnController !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">
                    DJ kemur með eigin spilara/controller:
                  </span>{" "}
                  {formData.techAndMusic.djBringsOwnController === true
                    ? "Já"
                    : formData.techAndMusic.djBringsOwnController === false
                      ? "Nei"
                      : "?"}
                </p>
              )}
              {formData.techAndMusic.needsMicrophone !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Míkrófón:</span>{" "}
                  {formData.techAndMusic.needsMicrophone === true
                    ? "Já"
                    : formData.techAndMusic.needsMicrophone === false
                      ? "Nei"
                      : "?"}
                </p>
              )}
              {formData.techAndMusic.liveBand !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Live hljómsveit:</span>{" "}
                  {formData.techAndMusic.liveBand === true
                    ? "Já"
                    : formData.techAndMusic.liveBand === false
                      ? "Nei"
                      : "?"}
                </p>
              )}
              {formData.techAndMusic.useProjector !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Skjávarpi:</span>{" "}
                  {formData.techAndMusic.useProjector === true
                    ? "Já"
                    : formData.techAndMusic.useProjector === false
                      ? "Nei"
                      : "?"}
                </p>
              )}
              {formData.techAndMusic.useLightsAndDiscoBall !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Ljós og diskókúla:</span>{" "}
                  {formData.techAndMusic.useLightsAndDiscoBall === true
                    ? "Já"
                    : formData.techAndMusic.useLightsAndDiscoBall === false
                      ? "Nei"
                      : "?"}
                </p>
              )}
              {formData.techAndMusic.equipmentBrought && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">Búnaður sem verður með:</span>{" "}
                  {formData.techAndMusic.equipmentBrought}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {formData.notes && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
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
            Tilbúið að staðfesta?
          </h3>
          <p className="text-sm text-[#fefff5] font-light">
            Við munum hafa samband innan skamms til að ganga frá síðustu
            smáatriðum.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
