import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Mail,
  Phone,
  User,
  Clock,
  MapPin,
  Building,
  Shield,
  FileText,
  ArrowLeft,
  Wifi,
  Info,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShieldX,
  Users,
  StickyNote,
  Calendar,
  Building2,
  PhoneCall,
  Repeat,
  Edit2,
} from "lucide-react";
import { useVisitorDetail } from "./hooks/use-visitor-detail";
import { Avatar } from "../host-dashboard/components/Avatar";
import { Button, cn } from "@visitly/ui";
import { format } from "date-fns";
import { useEntitlements } from "./hooks/useEntitlement";
import { useCancelVisit } from "./hooks/use-cancel-visit";
import { CancelVisitModal } from "./components/CancelVisitModal";
import { formatDate } from "@/shared/services/host-service";
import { getVerificationColor } from "@/shared/services/host-service";

const VisitorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entitlements = useEntitlements();
  const isPrefill = searchParams.get("isPrefill") === "true";
  const source = searchParams.get("source") || "unknown";

  const {
    visitor,
    offenders,
    idValidation,
    notifications,
    notes,
    isLoading,
    isError,
  } = useVisitorDetail(id || "", isPrefill, source);

  const [expandedAccordions, setExpandedAccordions] = useState<
    Record<string, boolean>
  >({
    visitInfo: true,
    hostDetails: true,
    watchlist: true,
    offenderCheck: true,
    idInformation: true,
    internalNotes: true,
    visitNotes: true,
    guestWifi: true,
    document: true,
  });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const cancelMutation = useCancelVisit();

  const toggleAccordion = (key: string) => {
    setExpandedAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (expand: boolean) => {
    const newState = Object.keys(expandedAccordions).reduce(
      (acc, key) => {
        acc[key] = expand;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setExpandedAccordions(newState);
  };

  const isAllOpen = Object.values(expandedAccordions).every((v) => v);

  if (isLoading) {
    return (
      <div className="tw:flex tw:items-center tw:justify-center tw:h-screen">
        {/* <div className="tw:animate-spin tw:rounded-full tw:h-12 tw:w-12 tw:border-b-2 tw:border-indigo-600"></div> */}
      </div>
    );
  }

  if (isError || !visitor) {
    return (
      <div className="tw:p-10 tw:text-center">
        <h2 className="tw:text-xl tw:font-semibold tw:text-red-600">
          Error loading visitor details
        </h2>
        <button
          onClick={() => navigate("/host/upcoming-visitors")}
          className="tw:mt-4 tw:text-indigo-600 tw:hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const v = visitor;
  const isUpcoming = isPrefill; // Logic from reference
  const status = isUpcoming ? v.status : (v as any).visitStatus; // Mapping status from reference

  return (
    <div className="tw:min-h-screen tw:bg-white tw:pb-10">
      <div className="tw:max-w-[1200px] tw:mx-auto tw:px-10 tw:py-7">
        {/* Breadcrumb */}
        <div className="tw:flex tw:items-center tw:gap-1.5 tw:text-[13px] tw:text-gray-400 tw:mb-5">

          <button
            onClick={() => navigate("/host/upcoming-visitors")}
            className="tw:text-indigo-600 tw:font-medium hover:tw:underline tw:transition-all"
          >
            Back
          </button>
          <ChevronRight size={14} />
          <span className="tw:text-gray-700 tw:font-medium">{v.fullName}</span>
        </div>

        {/* Page Header */}
        <div className="tw:flex tw:items-start tw:justify-between tw:gap-6 tw:mb-7 tw:flex-wrap">
          {/* Left: avatar + info */}
          <div className="tw:flex tw:items-center tw:gap-5">
            <div className="tw:w-[72px] tw:h-[72px]">
              {v.visitPhotoURI ? (
                <img
                  src={v.visitPhotoURI}
                  alt={v.fullName}
                  className="tw:w-full tw:h-full tw:rounded-full tw:object-cover"
                />
              ) : (
                <Avatar name={v.fullName} size={72} />
              )}
            </div>
            <div>
              <div className="tw:flex tw:gap-4">
                <h1 className="tw:flex tw:text-2xl tw:font-bold tw:text-gray-900 tw:tracking-[-0.3px] tw:leading-tight">
                  {v.fullName}
                </h1>
                {((v.recurrenceType && v.recurrenceType !== "NONE") ||
                  v.parentVisitId) && (
                    <span className="tw:px-3 tw:py-1 tw:rounded-full tw:text-[#5E2CED] tw:flex tw:gap-2 tw:justify-center tw:items-center tw:bg-[#E5E9FF]">
                      {" "}
                      <Repeat size={16} /> Recurring Visit{" "}
                    </span>
                  )}
              </div>
              <div className="tw:flex tw:items-center tw:gap-3 tw:mt-2 tw:flex-wrap">
                {v.email && (
                  <span className="tw:text-sm tw:text-gray-500">{v.email}</span>
                )}
                {v.companyName && (
                  <>
                    <span className="tw:text-gray-200">|</span>
                    <span className="tw:text-sm tw:text-gray-500 tw:flex">
                      <Building2 size={16} />{" "}
                      <span className="tw:block tw:px-2">{v.companyName}</span>
                    </span>
                  </>
                )}
              </div>
              <div className="tw:flex tw:items-center tw:gap-2.5 tw:mt-2.5">
                <StatusBadge status={status || "Scheduled"} />
                <span className="tw:inline-flex tw:items-center tw:px-3 tw:py-0.5 tw:rounded-full tw:text-[12px] tw:font-semibold tw:bg-[#EEF2FF] tw:text-[#4F46E5]">
                  {v.visitorType}
                </span>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="tw:flex tw:items-center tw:gap-2.5 tw:shrink-0">
            <Button leftIcon={<Edit2  size={15} />}
            variant="outline"
              className="tw:inline-flex tw:items-center tw:gap-1 tw:px-4.5 tw:py-2.5 tw:rounded-xl  tw:text-sm tw:font-medium hover:tw:border-red-300 hover:tw:bg-red-50 tw:transition-all"
           onClick={()=>navigate("/host/invite/"+id)}
          >
              Edit Visit
            </Button>
            {source != "pastVisitors" && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="tw:inline-flex tw:items-center tw:gap-2 tw:px-4.5 tw:py-2.5 tw:bg-white tw:border tw:border-red-200 tw:rounded-xl tw:text-red-600 tw:text-sm tw:font-medium hover:tw:border-red-300 hover:tw:bg-red-50 tw:transition-all"
              >
                <Trash2 size={15} />
                Cancel Visit
              </button>
            )}
          </div>
        </div>

        {/* Global Accordion Control */}
        <div className="tw:mb-4">
          <button
            onClick={() => toggleAll(!isAllOpen)}
            className="tw:flex tw:items-center tw:gap-1.5 tw:text-sm tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700"
          >
            {isAllOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isAllOpen ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Two-column layout grid */}
        <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-[1fr_380px] tw:gap-6 tw:items-start">
          {/* ============ LEFT COLUMN (60%) ============ */}
          <div className="tw:flex tw:flex-col tw:gap-6">
            <Accordion
              title="Visit Information"
              icon={Calendar}
              isOpen={!!expandedAccordions.visitInfo}
              onToggle={() => toggleAccordion("visitInfo")}
            >
              <div className="tw:flex tw:flex-col">
                {source !== "pastVisitors" && (
                  <>
                    <DetailRow
                      label="Location"
                      value={v.siteName}
                      icon={MapPin}
                    />
                    <DetailRow
                      label="Scheduled Check-In"
                      value={formatDate(
                        isPrefill
                          ? v.scheduledCheckInTime
                          : v.scheduleCheckinDate,
                      )}
                    />
                    <DetailRow
                      label="Scheduled Check-Out"
                      value={formatDate(v.scheduleCheckoutDate)}
                    />
                    {v.recurrenceType && v.recurrenceType !== "NONE" && (
                      <DetailRow label="Recurrence" value={v.recurrenceType} />
                    )}
                    <DetailRow
                      label="Prefill Status"
                      value={isPrefill ? "Yes" : "NO"}
                    />
                    <DetailRow
                      label="Phone Number"
                      icon={PhoneCall}
                      value={v.phoneNumber}
                    />
                    {v.groupName && (
                      <DetailRow label="Group" value={v.groupName} />
                    )}
                  </>
                )}

                {source === "pastVisitors" && (
                  <>
                    <DetailRow
                      label="Signed-In"
                      value={formatDate(v?.checkinTime)}
                    />
                    <DetailRow
                      label="Signed-Out"
                      value={formatDate(v?.checkoutTime)}
                    />
                    <DetailRow
                      label="Phone Number"
                      icon={PhoneCall}
                      value={v.phoneNumber}
                    />
                  </>
                )}

                {entitlements.isAdvancedMegaLocationEntitled && (
                  <>
                    {v.parkingLotName && (
                      <DetailRow label="Parking Lot" value={v.parkingLotName} />
                    )}
                    {v.poeName && (
                      <DetailRow label="Point of Entry" value={v.poeName} />
                    )}
                    {v.buildingName && (
                      <DetailRow label="Building" value={v.buildingName} />
                    )}
                  </>
                )}

                {/* Custom Fields as part of Visit Info */}
                {source !== "pastVisitors" && (
                  <div className="tw:mt-6 tw:pt-6 tw:border-gray-10">
                    <div className="tw:text-[12px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider tw:mb-4">
                      Additional Information
                    </div>
                    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:p-5 tw:mb-2 tw:shadow-sm">
                      {/* Header */}
                      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
                        <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">
                          Sign In
                        </h3>
                      </div>

                      {/* Content */}
                      {v.visitCustomFields && v.visitCustomFields.length > 0 ? (
                        <div className="tw:flex tw:flex-col tw:gap-2">
                          {v.visitCustomFields.map((cf, i) => (
                            <DetailRow
                              key={i}
                              label={cf.name}
                              value={cf.value}
                              isLast={i === v.visitCustomFields!.length - 1}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="tw:text-sm tw:text-gray-400 tw:italic tw:py-2">
                          No custom Sign-In fields added.
                        </div>
                      )}
                    </div>
                    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:p-5 tw:mb-2 tw:shadow-sm">
                      {/* Header */}
                      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
                        <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">
                          Sign Out
                        </h3>
                      </div>

                      {/* Content */}
                      {v.visitSignoutCustomFields &&
                        v.visitSignoutCustomFields.length > 0 ? (
                        <div className="tw:flex tw:flex-col tw:gap-2">
                          {v.visitSignoutCustomFields.map((cf, i) => (
                            <DetailRow
                              key={i}
                              label={cf.name}
                              value={cf.value}
                              isLast={
                                i === v.visitSignoutCustomFields!.length - 1
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="tw:text-sm tw:text-gray-400 tw:italic tw:py-2">
                          No custom Sign-Out fields added.
                        </div>
                      )}
                    </div>
                    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:p-5 tw:mb-2 tw:shadow-sm">
                      {/* Header */}
                      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
                        <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">
                          Internal
                        </h3>
                      </div>

                      {/* Content */}
                      {false ? (
                        <div className="tw:flex tw:flex-col tw:gap-2">
                          {(v?.visitCustomFields as any[])?.map((cf, i) => (
                            <DetailRow
                              key={i}
                              label={cf.name}
                              value={cf.value}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="tw:text-sm tw:text-gray-400 tw:italic tw:py-2">
                          No custom Internal fields added.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {source == "pastVisitors" && (
                  <div className="tw:mt-6 tw:pt-6 tw:border-t tw:border-gray-100">
                    <div className="tw:text-[12px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider tw:mb-4">
                      Additional Information
                    </div>
                    <div className="tw:bg-white tw:rounded-xl tw:p-5">
                      {/* Header */}
                      {/* Content */}
                      {v.visitCustomFields && v.visitCustomFields.length > 0 ? (
                        <div className="tw:flex tw:flex-col tw:gap-2">
                          {v.visitCustomFields.map((cf, i) => (
                            <DetailRow
                              key={i}
                              label={cf.name}
                              value={cf.value}
                              isLast={i === v.visitCustomFields!.length - 1}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="tw:text-sm tw:text-gray-400 tw:italic tw:py-2">
                          No Additional Information added.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Accordion>

            {isPrefill && entitlements.advanceWatchListEntitled && (
              <Accordion
                title="Watchlist Rules"
                icon={Shield}
                isOpen={!!expandedAccordions.watchlist}
                onToggle={() => toggleAccordion("watchlist")}
              >
                <div className="tw:overflow-x-auto">
                  <table className="tw:w-full">
                    <thead className="tw:bg-gray-50/50">
                      <tr>
                        <th className="tw:px-4 tw:py-3 tw:text-left tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                          Rule Type
                        </th>
                        <th className="tw:px-4 tw:py-3 tw:text-left tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                          Match
                        </th>
                        <th className="tw:px-4 tw:py-3 tw:text-left tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                          Scope
                        </th>
                        <th className="tw:px-4 tw:py-3 tw:text-left tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="tw:divide-y tw:divide-gray-50">
                      {(v.visitorWatchModelList || []).length > 0 ? (
                        v.visitorWatchModelList!.map((item, i) => (
                          <tr
                            key={i}
                            className="hover:tw:bg-gray-50/30 tw:transition-colors"
                          >
                            <td className="tw:px-4 tw:py-3 tw:text-sm tw:text-gray-600">
                              {item.watchGroupType === "VISIT_FIELD" &&
                                "Visit Field"}
                              {item.watchGroupType === "PAST_VISIT" &&
                                "Past Visit"}
                              {item.watchGroupType === "PHOTO_FACEID" &&
                                "Face Match"}
                              {item.watchGroupType === "ID_VALIDATION" &&
                                "ID Validation"}
                            </td>
                            <td className="tw:px-4 tw:py-3 tw:text-sm">
                              {item.keyName !== "FaceId" ? (
                                <div className="tw:text-gray-800">
                                  <span className="tw:font-semibold">
                                    {item.keyName}:{" "}
                                  </span>
                                  {item.value}
                                </div>
                              ) : (
                                <img
                                  src={
                                    item.imageUrl ||
                                    "/assets/images/defaultuser.jpg"
                                  }
                                  alt="Face Match"
                                  className="tw:h-10 tw:w-10 tw:rounded-full tw:object-cover"
                                />
                              )}
                            </td>
                            <td className="tw:px-4 tw:py-3 tw:text-sm tw:text-gray-600">
                              {item.siteId ? "Location" : "Global"}
                            </td>
                            <td className="tw:px-4 tw:py-3 tw:text-sm tw:text-gray-500 tw:max-w-[200px] tw:truncate">
                              {item.watchlistRuleDescription || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="tw:px-4 tw:py-8 tw:text-center tw:text-sm tw:text-gray-400 tw:italic"
                          >
                            No watchlist records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Accordion>
            )}

            {(v.guestWifiSSID || v.guestWifiPassword) && (
              <Accordion
                title="Guest Wifi Information"
                icon={Wifi}
                isOpen={!!expandedAccordions.guestWifi}
                onToggle={() => toggleAccordion("guestWifi")}
              >
                <div className="tw:flex tw:flex-col">
                  <DetailRow
                    label="Wifi SSID"
                    value={v.guestWifiSSID}
                    icon={Wifi}
                  />
                  <DetailRow
                    label="Wifi Password"
                    value={v.guestWifiPassword || "-"}
                    icon={Shield}
                    isLast
                  />
                </div>
              </Accordion>
            )}
          </div>

          {/* ============ RIGHT COLUMN (40%) ============ */}
          <div className="tw:flex tw:flex-col tw:gap-6">
            <Accordion
              title="Host Information"
              icon={Users}
              isOpen={!!expandedAccordions.hostDetails}
              onToggle={() => toggleAccordion("hostDetails")}
            >
              <div className="tw:flex tw:items-center tw:gap-3.5 tw:mb-4">
                <Avatar name={v.hostName || "Host"} size={44} />
                <div className="tw:min-w-0">
                  <div className="tw:text-[15px] tw:font-semibold tw:text-gray-900 tw:truncate">
                    {v.hostName || "—"}
                  </div>
                  <div className="tw:text-[13px] tw:text-gray-400 tw:mt-0.5 tw:truncate">
                    {v.hostEmail || "—"}
                  </div>
                </div>
              </div>

              {v.cohosts && v.cohosts.length > 0 && (
                <div className="tw:mt-4 tw:pt-4 tw:border-gray-100">
                  <div className="tw:text-[12px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider tw:mb-4">
                    Co-hosts
                  </div>
                  <div className="tw:flex tw:flex-col tw:gap-3">
                    {v.cohosts.map((ch, i) => (
                      <div
                        key={i}
                        className="tw:flex tw:items-center tw:gap-2.5"
                      >
                        <Avatar name={ch.cohostName || "CH"} size={32} />
                        <div className="tw:min-w-0">
                          <div className="tw:text-sm tw:font-medium tw:text-gray-800 tw:truncate">
                            {ch.cohostName || "—"}
                          </div>
                          <div className="tw:text-xs tw:text-gray-400 tw:truncate">
                            {ch.cohostEmail || "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Accordion>

            {isPrefill &&
              (entitlements.idValidationEntitled ||
                entitlements.offenderCheckEntitled) && (
                <Accordion
                  title="Verification"
                  icon={Shield}
                  isOpen={
                    !!expandedAccordions.offenderCheck ||
                    !!expandedAccordions.idInformation
                  }
                  onToggle={() => {
                    toggleAccordion("offenderCheck");
                    toggleAccordion("idInformation");
                  }}
                >
                  <div className="tw:flex tw:flex-col tw:gap-4">
                    {entitlements.idValidationEntitled && (
                      <div className="tw:flex tw:items-center tw:justify-between tw:p-1">
                        <div className="tw:flex tw:items-center tw:gap-2.5">
                          <ShieldCheck size={16} className="tw:text-gray-400" />
                          <span className="tw:text-sm tw:text-gray-600">
                            ID Verification
                          </span>
                        </div>

                        <span
                          style={{
                            color: getVerificationColor(
                              v.idVerificationStatus || "Skipped",
                            ),
                          }}
                          className="tw:text-sm tw:font-semibold"
                        >
                          {v.idVerificationStatus || "Skipped"}
                        </span>
                      </div>
                    )}

                    {entitlements.offenderCheckEntitled && (
                      <div className="tw:flex tw:items-center tw:justify-between tw:p-1">
                        <div className="tw:flex tw:items-center tw:gap-2.5">
                          <ShieldX size={16} className="tw:text-gray-400" />
                          <span className="tw:text-sm tw:text-gray-600">
                            Offender Check
                          </span>
                        </div>

                        <span
                          style={{
                            color: getVerificationColor(
                              v.offenderCheckStatus || "Skipped",
                            ),
                          }}
                          className="tw:text-sm tw:font-semibold"
                        >
                          {v.offenderCheckStatus || "Skipped"}
                        </span>
                      </div>
                    )}
                  </div>
                </Accordion>
              )}

            {isPrefill && entitlements.idValidationEntitled && (
              <Accordion
                title="ID Details"
                icon={ShieldCheck}
                isOpen={!!expandedAccordions.idInformation}
                onToggle={() => toggleAccordion("idInformation")}
              >
                {idValidation ? (
                  <div className="tw:flex tw:flex-col tw:gap-6">
                    <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                      <div>
                        <p className="tw:text-[10px] tw:font-bold tw:text-gray-400 tw:uppercase tw:mb-2 text-center">
                          Front Side
                        </p>
                        <div className="tw:aspect-[1.6/1] tw:bg-gray-50 tw:rounded-lg tw:border tw:border-gray-100 tw:overflow-hidden tw:flex tw:items-center tw:justify-center">
                          {idValidation?.idFrontImgUri ? (
                            <img
                              src={idValidation?.idFrontImgUri}
                              alt="ID Front"
                              className="tw:w-full tw:h-full tw:object-contain"
                            />
                          ) : (
                            <Shield className="tw:text-gray-200" size={32} />
                          )}
                        </div>
                      </div>
                      {idValidation?.idBackImgUri && (
                        <div>
                          <p className="tw:text-[10px] tw:font-bold tw:text-gray-400 tw:uppercase tw:mb-2 text-center">
                            Back Side
                          </p>
                          <div className="tw:aspect-[1.6/1] tw:bg-gray-50 tw:rounded-lg tw:border tw:border-gray-100 tw:overflow-hidden tw:flex tw:items-center tw:justify-center">
                            {idValidation?.idBackImgUri ? (
                              <img
                                src={idValidation?.idBackImgUri}
                                alt="ID Back"
                                className="tw:w-full tw:h-full tw:object-contain"
                              />
                            ) : (
                              <Shield className="tw:text-gray-200" size={32} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="tw:flex tw:flex-col tw:border-t tw:border-gray-50 tw:pt-4">
                      <DetailRow
                        label="First Name"
                        value={idValidation?.firstName}
                      />
                      <DetailRow
                        label="Last Name"
                        value={idValidation?.lastName}
                      />
                      <DetailRow
                        label="DOB"
                        value={idValidation?.dateOfBirth}
                      />
                      <DetailRow
                        label="Expiry"
                        value={idValidation?.expiryDate}
                      />
                      <DetailRow
                        label="ID Type"
                        value={idValidation?.idType}
                        isLast
                      />
                    </div>
                  </div>
                ) : (
                  <p className="tw:text-sm tw:text-gray-400 tw:italic tw:text-center tw:py-4">
                    No ID verification data available.
                  </p>
                )}
              </Accordion>
            )}

            {/* Documents as part of Visit Info or separate section */}

            {source !== "pastVisitors" && (
              <Accordion
                title="Documents"
                icon={StickyNote}
                isOpen={!!expandedAccordions.document}
                onToggle={() => toggleAccordion("document")}
                className="tw:bg-[#FFFBEB] tw:border-[#FEF3C7]"
              >
                <div className="tw:mt-1 tw:pt-1 tw:border-gray-100">
                  {/* <div className="tw:text-[12px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider tw:mb-4">
                    Documents
                  </div> */}
                  {v.visitSignedDocsInfos &&
                    v.visitSignedDocsInfos.length > 0 ? (
                    <div className="tw:flex tw:flex-col tw:gap-2.5">
                      {v.visitSignedDocsInfos.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.signedDocUri}
                          target="_blank"
                          rel="noreferrer"
                          className="tw:flex tw:items-center tw:gap-3 tw:p-3.5 tw:bg-indigo-50 tw:rounded-xl tw:text-sm tw:text-indigo-600 tw:font-medium tw:transition-all hover:tw:bg-indigo-100"
                        >
                          <FileText size={18} />
                          <span>{doc.orgDocTemplateName}</span>

                          <ArrowRight
                            size={14}
                            className="tw:ml-auto tw:opacity-60"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="tw:text-sm tw:text-gray-400 tw:italic tw:py-2">
                      No documents
                    </div>
                  )}
                </div>
              </Accordion>
            )}

            {
              <Accordion
                title="Internal Notes"
                icon={StickyNote}
                isOpen={!!expandedAccordions.internalNotes}
                onToggle={() => toggleAccordion("internalNotes")}
                className="tw:bg-[#FFFBEB] tw:border-[#FEF3C7]"
              >
                <div className="tw:text-sm tw:text-gray-700 tw:leading-relaxed tw:whitespace-pre-wrap">
                  {v.internalNote}
                </div>
              </Accordion>
            }

            {false && notes && notes.length > 0 && (
              <Accordion
                title="Visit Notes"
                icon={StickyNote}
                isOpen={!!expandedAccordions.visitNotes}
                onToggle={() => toggleAccordion("visitNotes")}
              >
                {notes && notes.length > 0 ? (
                  <div className="tw:flex tw:flex-col tw:gap-3.5">
                    {notes.map((note, i) => (
                      <div
                        key={i}
                        className="tw:bg-gray-50/50 tw:p-3.5 tw:rounded-xl tw:border tw:border-gray-50"
                      >
                        <div className="tw:flex tw:items-center tw:justify-between tw:mb-2 text-[11px]">
                          <span className="tw:font-bold tw:text-gray-900">
                            {note.createdBy}
                          </span>
                          <span className="tw:text-gray-400">
                            {formatDate(note.createdDate)}
                          </span>
                        </div>
                        <p className="tw:text-[13px] tw:text-gray-600 tw:leading-relaxed">
                          {note?.noteText}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tw:text-center tw:text-sm tw:text-gray-400 tw:italic">
                    No visit notes available.
                  </div>
                )}
              </Accordion>
            )}

            {isPrefill && entitlements.offenderCheckEntitled && (
              <Accordion
                title="Offender Check (Detail)"
                icon={ShieldX}
                isOpen={!!expandedAccordions.offenderCheck}
                onToggle={() => toggleAccordion("offenderCheck")}
              >
                {offenders?.offenderInformationCheckDetails?.length ? (
                  <div className="tw:overflow-hidden tw:border tw:border-gray-100 tw:rounded-xl">
                    <table className="tw:w-full tw:text-left">
                      <thead className="tw:bg-gray-50/50 tw:border-b tw:border-gray-100">
                        <tr>
                          <th className="tw:px-4 tw:py-3 tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                            Photo
                          </th>
                          <th className="tw:px-4 tw:py-3 tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                            Name
                          </th>
                          {/* <th className="tw:px-4 tw:py-3 tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">
                            Details
                          </th> */}
                        </tr>
                      </thead>
                      <tbody className="tw:divide-y tw:divide-gray-50">
                        {offenders.offenderInformationCheckDetails.map(
                          (o, i) => (
                            <tr
                              key={i}
                              className="hover:tw:bg-gray-50/30 tw:transition-colors"
                            >
                              <td className="tw:px-4 tw:py-3">
                                <img
                                  src={
                                    o.photo || "/assets/images/defaultuser.jpg"
                                  }
                                  alt="Offender"
                                  className="tw:w-10 tw:h-10 tw:rounded-full tw:object-cover"
                                />
                              </td>
                              <td className="tw:px-4 tw:py-3 tw:text-sm tw:font-medium tw:text-gray-900">
                                {o.firstname} {o.lastname}
                              </td>
                              {/* <td className="tw:px-4 tw:py-3">
                                <button className="tw:text-xs tw:font-semibold tw:text-indigo-600 hover:tw:underline">
                                  View Record
                                </button>
                              </td> */}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="tw:text-sm tw:text-gray-400 tw:italic tw:text-center tw:py-4">
                    Unable to Perform
                  </p>
                )}
              </Accordion>
            )}
          </div>
        </div>
      </div>

      <CancelVisitModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        isRecurring={
          !!(
            (v.recurrenceType && v.recurrenceType !== "NONE") ||
            v.parentVisitId
          )
        }
        visitDate={formatDate(v.scheduleCheckinDate)}
        onConfirm={(params: any) => {
          cancelMutation.mutate(
            { id: id || "", params },
            {
              onSuccess: () => {
                setIsCancelModalOpen(false);
                // Optionally navigate back after cancellation
                // navigate(-1);
              },
            },
          );
        }}
      />
    </div>
  );
};

/* Sub-components */

const DetailRow = ({
  label,
  value,
  icon: Icon,
  isLast,
}: {
  label: string;
  value?: string;
  icon?: React.ElementType;
  isLast?: boolean;
}) => (
  <div
    className={cn(
      "tw:flex tw:justify-between tw:items-start tw:py-2.5 tw:gap-4",
      !isLast && "tw:border-b tw:border-gray-50",
    )}
  >
    <span className="tw:text-[13px] tw:text-gray-400 tw:shrink-0 tw:min-w-[120px]">
      {label}
    </span>
    <span className="tw:text-sm tw:font-medium tw:text-gray-800 tw:text-right tw:flex tw:items-center tw:gap-1.5 tw:justify-end">
      {Icon && <Icon size={14} className="tw:text-gray-400" />}
      {value || "—"}
    </span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getBadgeStyles = (s: string) => {
    const val = s?.toLowerCase() || "";
    if (val.includes("passed") || val.includes("valid") || val === "yes") {
      return "tw:bg-emerald-50 tw:text-emerald-600";
    }
    if (val.includes("failed") || val.includes("match found") || val === "no") {
      return "tw:bg-red-50 tw:text-red-600";
    }
    return "tw:bg-gray-100 tw:text-gray-600";
  };

  return (
    <span
      className={cn(
        "tw:inline-flex tw:items-center tw:px-2.5 tw:py-0.5 tw:rounded-md tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-wide",
        getBadgeStyles(status),
      )}
    >
      {status}
    </span>
  );
};

const Accordion = ({
  title,
  icon: Icon,
  children,
  isOpen,
  onToggle,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) => (
  <div
    className={cn(
      "tw:bg-white tw:rounded-[14px] tw:border tw:border-gray-100 tw:shadow-[0_1px_3px_rgba(0,0,0,0.04)] tw:overflow-hidden",
      className,
    )}
  >
    <button
      onClick={onToggle}
      className="tw:w-full tw:px-6 tw:py-[18px] tw:flex tw:items-center tw:justify-between hover:tw:bg-gray-50/50 tw:transition-colors"
    >
      <div className="tw:flex tw:items-center tw:gap-2">
        <Icon size={14} className="tw:text-gray-400" />
        <h3 className="tw:text-[12px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-[0.08em]">
          {title}
        </h3>
      </div>
      {isOpen ? (
        <ChevronUp size={18} className="tw:text-gray-400" />
      ) : (
        <ChevronDown size={18} className="tw:text-gray-400" />
      )}
    </button>
    {isOpen && <div className="tw:px-6 tw:pb-6 tw:pt-0">{children}</div>}
  </div>
);

export default VisitorDetail;
