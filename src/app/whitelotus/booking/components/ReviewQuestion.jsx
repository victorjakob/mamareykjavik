import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function ReviewQuestion({ formData, updateFormData, t }) {
  const { language } = useLanguage();
  const formatGuestCount = (count) => {
    const counts = {
      "undir-10": t("under10") + " " + t("guests"),
      "10-25": "10-25 " + t("guests"),
      "26-50": "26-50 " + t("guests"),
      "51-75": "51-75 " + t("guests"),
      "76-100": "76-100 " + t("guests"),
      "100+": "100+ " + t("guests"),
    };
    return counts[count] || count;
  };

  const formatServices = (services) => {
    const serviceLabels = {
      food: t("food"),
      drinks: t("drinks"),
      eventManager: t("eventManager") || "Atriði/Veislustjóri",
    };
    return (
      services?.map((s) => serviceLabels[s] || s).join(", ") ||
      t("noServicesSelected")
    );
  };

  const formatRoomSetup = (setup) => {
    const setups = {
      seated: t("seated") + " - " + t("seatedDescription"),
      standing: t("standing") + " - " + t("standingDescription"),
      mixed: t("mixed") + " - " + t("mixedDescription"),
      lounge: t("lounge") + " - " + t("loungeDescription"),
      presentation: t("presentation") + " - " + t("presentationDescription"),
    };
    return setups[setup] || setup;
  };

  const formatTablecloth = (tableclothData) => {
    if (!tableclothData) return t("notSelected");
    if (tableclothData.wantsToRentTablecloths === false) {
      return t("notRentingTablecloths");
    }
    if (tableclothData.wantsToRentTablecloths === true) {
      const color =
        tableclothData.tableclothColor === "white"
          ? t("whiteTablecloths")
          : tableclothData.tableclothColor === "black"
            ? t("blackTablecloths")
            : "";
      return color || t("notSelected");
    }
    return t("notSelected");
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return t("notSelected");
    const date = new Date(dateTimeString);
    const locale = language === "en" ? "en-US" : "is-IS";
    return date.toLocaleDateString(locale, {
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
    return type || t("notSelected");
  };

  const formatTime = (timeString) => {
    if (!timeString) return t("notSelected");
    // If it's already a formatted time string (from text input), return as-is
    // Otherwise try to format it as a time
    if (timeString.includes(":") && timeString.length <= 5) {
      try {
        const locale = language === "en" ? "en-US" : "is-IS";
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
          locale,
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      } catch {
        return timeString;
      }
    }
    return timeString;
  };

  const formatBarType = (barType) => {
    const types = {
      openBar: t("openBar") + " - " + t("openBarDescription"),
      prePurchased: t("prePurchased") + " - " + t("prePurchasedDescription"),
      peoplePayThemselves: t("peoplePayThemselves"),
    };
    return types[barType] || barType;
  };

  const formatYesNoUnknown = (value) => {
    if (value === true) return t("yes");
    if (value === false) return t("no");
    if (value === undefined) return "?";
    return t("notSelected");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-20"
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        {t("reviewTitle")}
      </h2>

      <div className="text-center mb-8">
        <p className="text-[#fefff5] font-light">
          {t("reviewSubtitle")}
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
            <span>{t("contactInfo")}</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("name")}</span>{" "}
              {formData.contact?.name}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("email")}:</span>{" "}
              {formData.contact?.email}
            </p>
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("phoneLabel")}</span>{" "}
              {formData.contact?.phone}
            </p>
            {formData.contact?.company && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">
                  {t("companyLabel")}
                </span>{" "}
                {formData.contact.company}
              </p>
            )}
            {formData.contact?.kennitala && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">{t("kennitalaLabel")}</span>{" "}
                {formData.contact.kennitala}
              </p>
            )}
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
            <span>{t("services")}</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("selectedServices")}</span>{" "}
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
                  <span className="font-light text-[#a77d3b]">{t("foodLabel")}</span>{" "}
                  {formData.food === "buffet"
                    ? t("buffet")
                    : formData.food === "plated"
                      ? t("plated")
                      : formData.food === "fingerFood"
                        ? t("fingerFood")
                        : formData.food}
                  {formData.foodDetail && (
                    <>
                      {" - "}
                      {formData.foodDetail === "classic"
                        ? t("classic")
                        : formData.foodDetail === "simplified"
                          ? t("simplified")
                          : formData.foodDetail === "3course"
                            ? t("threeCourse")
                            : formData.foodDetail === "2course"
                              ? t("twoCourse")
                              : formData.foodDetail === "half"
                                ? t("half") + " (" + t("halfDescription") + ")"
                                : formData.foodDetail === "full"
                                  ? t("full") + " (" + t("fullDescription") + ")"
                                  : formData.foodDetail}
                    </>
                  )}
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
                  <span className="font-light text-[#a77d3b]">{t("drinksLabel")}</span>{" "}
                  {formatBarType(formData.drinks.barType)}
                </p>
                {formData.drinks.preOrder &&
                  Object.keys(formData.drinks.preOrder).length > 0 && (
                    <div className="mt-2">
                      <p className="text-[#fefff5] font-light text-xs mb-1">
                        <span className="font-light text-[#a77d3b]">
                          {t("preOrder")}
                        </span>
                      </p>
                      <div className="space-y-1 text-xs text-[#fefff5]/80 font-light pl-4">
                        {Object.entries(formData.drinks.preOrder).map(
                          ([key, quantity]) => {
                            if (quantity > 0) {
                              const labels = {
                                beerKeg: t("beerKeg"),
                                cocktails: t("cocktails"),
                                whiteWine: t("whiteWine"),
                                redWine: t("redWine"),
                                sparklingWine: t("sparklingWine"),
                              };
                              return (
                                <p key={key}>
                                  • {labels[key] || key}: {quantity}
                                </p>
                              );
                            }
                            return null;
                          }
                        )}
                      </div>
                    </div>
                  )}
                {formData.drinks.specialRequests && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">{t("specialRequestsLabel")}</span>{" "}
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
                <span className="font-light text-[#a77d3b]">{t("eventManager")}</span>{" "}
                {formData.eventManager?.contact?.name || t("yes")}
              </p>
            )}
            {/* Agreement Confirmations - Displayed as a subtle note at the end */}
            {(formData.staffCostAcknowledged ||
              formData.noOwnAlcoholConfirmed) && (
              <div className="mt-4 pt-4 border-t border-slate-600/20">
                <p className="text-[#fefff5]/60 font-light text-xs mb-1">
                  {t("confirmations")}
                </p>
                <div className="space-y-1 text-xs text-[#fefff5]/70 font-light">
                  {formData.staffCostAcknowledged && (
                    <p>
                      <span className="text-[#a77d3b]/70">✓</span>{" "}
                      {t("staffCostConfirmed")}
                    </p>
                  )}
                  {formData.noOwnAlcoholConfirmed && (
                    <p>
                      <span className="text-[#a77d3b]/70">✓</span> {t("alcoholRuleConfirmed")}
                    </p>
                  )}
                </div>
              </div>
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
            <span>{t("eventDetails")}</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("guests")}</span>{" "}
              {formatGuestCount(formData.guestCount)}
            </p>
            {formData.guestCountComment && (
              <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                💬 {formData.guestCountComment}
              </p>
            )}
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("roomSetup")}:</span>{" "}
              {formatRoomSetup(formData.roomSetup)}
            </p>
            {formData.roomSetupComment && (
              <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                💬 {formData.roomSetupComment}
              </p>
            )}
            {formData.tableclothData && (
              <>
                {formData.tableclothData.wantsToRentTablecloths !==
                  undefined && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">{t("tablecloth")}:</span>{" "}
                    {formatTablecloth(formData.tableclothData)}
                  </p>
                )}
                {formData.tableclothData.needsNapkins !== undefined && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">
                      {t("napkins")}
                    </span>{" "}
                    {formatYesNoUnknown(formData.tableclothData.needsNapkins)}
                  </p>
                )}
                {formData.tableclothData.needsCandles !== undefined && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">{t("candles")}</span>{" "}
                    {formatYesNoUnknown(formData.tableclothData.needsCandles)}
                  </p>
                )}
                {formData.tableclothData.decorationComments && (
                  <p className="text-[#fefff5] font-light">
                    <span className="font-light text-[#a77d3b]">
                      {t("decorationComments")}:
                    </span>{" "}
                    {formData.tableclothData.decorationComments}
                  </p>
                )}
              </>
            )}
            {formData.eventType && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">
                  {t("eventType")}:
                </span>{" "}
                {formatEventType(formData.eventType)}
              </p>
            )}
            <p className="text-[#fefff5] font-light">
              <span className="font-light text-[#a77d3b]">{t("date")}</span>{" "}
              {formatDateTime(formData.dateTime?.preferred)}
            </p>
            {formData.dateTime?.startTime && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">{t("startTime")}</span>{" "}
                {formatTime(formData.dateTime.startTime)}
              </p>
            )}
            {formData.dateTime?.endTime && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">{t("endTime")}</span>{" "}
                {formatTime(formData.dateTime.endTime)}
              </p>
            )}
            {formData.needsEarlyAccess !== undefined && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">
                  {t("earlyAccess")}
                </span>{" "}
                {formatYesNoUnknown(formData.needsEarlyAccess)}
              </p>
            )}
            {formData.setupTime && (
              <p className="text-[#fefff5] font-light">
                <span className="font-light text-[#a77d3b]">
                  {t("setupTime")}
                </span>{" "}
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
              <span>{t("techAndMusic")}</span>
            </h3>
            <div className="space-y-2 text-sm">
              {formData.techAndMusic.djOnSite !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">
                    {t("djOnSiteLabel")}
                  </span>{" "}
                  {formatYesNoUnknown(formData.techAndMusic.djOnSite)}
                </p>
              )}
              {formData.techAndMusic.djBringsOwnController !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">
                    {t("djBringsControllerLabel")}
                  </span>{" "}
                  {formatYesNoUnknown(
                    formData.techAndMusic.djBringsOwnController
                  )}
                </p>
              )}
              {formData.techAndMusic.needsMicrophone !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">{t("needsMicrophoneLabel")}</span>{" "}
                  {formatYesNoUnknown(formData.techAndMusic.needsMicrophone)}
                </p>
              )}
              {formData.techAndMusic.liveBand !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">
                    {t("liveBandLabel")}
                  </span>{" "}
                  {formatYesNoUnknown(formData.techAndMusic.liveBand)}
                </p>
              )}
              {formData.techAndMusic.useProjector !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">{t("useProjectorLabel")}</span>{" "}
                  {formatYesNoUnknown(formData.techAndMusic.useProjector)}
                </p>
              )}
              {formData.techAndMusic.useLightsAndDiscoBall !== undefined && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">
                    {t("useLightsLabel")}
                  </span>{" "}
                  {formatYesNoUnknown(
                    formData.techAndMusic.useLightsAndDiscoBall
                  )}
                </p>
              )}
              {formData.techAndMusic.equipmentBrought && (
                <p className="text-[#fefff5] font-light">
                  <span className="font-light text-[#a77d3b]">
                    {t("equipmentBroughtLabel")}
                  </span>{" "}
                  {formData.techAndMusic.equipmentBrought}
                </p>
              )}
              {formData.techAndMusic.comment && (
                <p className="text-[#fefff5]/80 font-light italic text-xs mt-1">
                  💬 {formData.techAndMusic.comment}
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
              <span>{t("notes")}</span>
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
            {t("reviewReadyTitle")}
          </h3>
          <p className="text-sm text-[#fefff5] font-light">
            {t("reviewReadyMessage")}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
