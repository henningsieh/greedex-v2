import React, { useEffect, useRef, useState } from "react";
import "flag-icons/css/flag-icons.min.css"; // ⭐ NEU

const CO2_PER_KM = { flight: 0.386, train: 0.074, bus: 0.068, car: 0.36 };
const TREE_CALCULATIONS = { co2PerTreePerYear: 30, treeLifespan: 100 };

// ========================================
// FOOD CO2 VALUES (per day)
// ========================================
const FOOD_CO2_PER_DAY = {
  never: 1.5, // Vegetarian: ~1.5 kg CO2/day
  rarely: 2.5, // 1-2x/week meat: ~2.5 kg CO2/day
  sometimes: 3.5, // 3-4x/week meat: ~3.5 kg CO2/day
  "almost every day": 5, // 5-6x/week meat: ~5 kg CO2/day
  "every day": 7, // Daily meat: ~7 kg CO2/day
};

// ========================================
// ACCOMMODATION CO2 VALUES (per night)
// ========================================
const ACCOMMODATION_CO2 = {
  Camping: 3,
  Hostel: 15,
  "3★ Hotel": 40,
  "4★ Hotel": 80,
  "5★ Hotel": 120,
  Apartment: 30,
  "Friends/Family": 10,
};

const ELECTRICITY_CO2 = {
  "green energy": 5,
  "conventional energy": 20,
  "could not find out": 20, // Same as conventional
};

const ROOM_OCCUPANCY_DIVISOR = {
  alone: 1,
  "2 people": 2,
  "3 people": 3,
  "4+ people": 4,
};

// ========================================
// GLOBAL HELPER FUNCTION: project days
// ========================================

/**
 * Calculate project duration in days
 * @param {string} startDate - ISO date string (YYYY-MM-DD)
 * @param {string} endDate - ISO date string (YYYY-MM-DD)
 * @returns {number} Number of days (inclusive)
 */
function calculateProjectDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// ========================================
// TYPEWRITER TEXT COMPONENT (GLOBAL)
// ========================================
function TypewriterText({ text, speed = 30, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <>{displayedText}</>;
}

// ========================================
// NOTIFICATION QUEUE HOOK (with cooldown)
// ========================================
function useNotificationQueue(participants) {
  const [queue, setQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isShowing, setIsShowing] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false); // ⭐ NEU
  const previousCountRef = useRef(0);

  // Detect new participants
  useEffect(() => {
    if (participants.length > previousCountRef.current) {
      const newParticipants = participants.slice(previousCountRef.current);
      setQueue((prev) => [...prev, ...newParticipants]);
    }
    previousCountRef.current = participants.length;
  }, [participants]);

  // Process queue
  useEffect(() => {
    if (!isShowing && !isCooldown && queue.length > 0) {
      // ⭐ Check cooldown
      const next = queue[0];
      setCurrentNotification(next);
      setIsShowing(true);
      setQueue((prev) => prev.slice(1));

      // Hide after 3 seconds
      setTimeout(() => {
        setIsShowing(false);

        // Fade out + Cooldown
        setTimeout(() => {
          setCurrentNotification(null);
          setIsCooldown(true); // ⭐ Start cooldown

          // End cooldown after 2 seconds
          setTimeout(() => {
            setIsCooldown(false); // ⭐ End cooldown
          }, 2500);
        }, 500);
      }, 2500);
    }
  }, [queue, isShowing, isCooldown]); // ⭐ Add isCooldown dependency

  return { currentNotification, isShowing };
}

// ========================================
// UPDATED STEPS ARRAY - COUNTRY AFTER NAME
// ========================================

const steps = [
  {
    name: "days",
    title: "How many days are you participating on your project?",
    type: "number",
    key: "days",
    min: 1,
    hint: "without travel days",
    defaultValue: 0,
  },
  {
    name: "accommodationCategory",
    title: "Which type of accommodation are you staying in?",
    type: "options",
    key: "accommodationCategory",
    options: [
      "Camping",
      "Hostel",
      "3★ Hotel",
      "4★ Hotel",
      "5★ Hotel",
      "Apartment",
      "Friends/Family",
    ],
  },
  {
    name: "roomOccupancy",
    title: "How many people are sharing the room/tent?",
    type: "options",
    key: "roomOccupancy",
    options: ["alone", "2 people", "3 people", "4+ people"],
  },
  {
    name: "electricity",
    title: "Which type of energy does your accommodation use?",
    type: "options",
    key: "electricity",
    options: ["green energy", "conventional energy", "could not find out"],
  },
  {
    name: "food",
    title: "How often do you plan to eat meat on your project?",
    type: "options",
    key: "food",
    options: ["never", "rarely", "sometimes", "almost every day", "every day"],
  },
  {
    name: "flightKm",
    title: "Your way TO the project: How many kilometres did you fly?",
    type: "number",
    key: "flightKm",
    min: 0,
    defaultValue: 0,
  },
  {
    name: "boatKm",
    title: "Your way TO the project: How many kilometres did you go by boat?",
    type: "number",
    key: "boatKm",
    min: 0,
    defaultValue: 0,
  },
  {
    name: "trainKm",
    title:
      "Your way TO the project: How many kilometres did you go by train or metro?",
    type: "number",
    key: "trainKm",
    min: 0,
    defaultValue: 0,
  },
  {
    name: "busKm",
    title:
      "Your way TO the project: How many kilometres did you go by bus/van?",
    type: "number",
    key: "busKm",
    min: 0,
    defaultValue: 0,
  },
  {
    name: "carKm",
    title: "Your way TO the project: How many kilometres did you go by car?",
    type: "number",
    key: "carKm",
    min: 0,
    defaultValue: 0,
  },
  {
    name: "carType",
    title: "What type of car did you use?",
    type: "options",
    key: "carType",
    options: ["conventional (diesel, petrol, gas…)", "electric"],
    conditional: true,
    dependsOn: "carKm",
  },
  {
    name: "carPassengers",
    title: "How many participants (including you) were sitting in the car?",
    type: "number",
    key: "carPassengers",
    min: 1,
    defaultValue: 1,
    conditional: true,
    dependsOn: "carKm",
  },
  {
    name: "age",
    title: "How old are you?",
    type: "number",
    key: "age",
    min: 1,
    defaultValue: 0,
  },
  {
    name: "gender",
    title: "What is your gender?",
    type: "options",
    key: "gender",
    options: ["Female", "Male", "Other / Prefer not to say"],
  },
];

function calculateCO2(data, projectActivityTransport = null) {
  const days = Number(data.days) || 0; // ⭐ EINMAL am Anfang deklarieren

  const flightCO2 = (Number(data.flightKm) || 0) * CO2_PER_KM.flight;
  const trainCO2 = (Number(data.trainKm) || 0) * CO2_PER_KM.train;
  const busCO2 = (Number(data.busKm) || 0) * CO2_PER_KM.bus;
  let carCO2 = 0;
  if (Number(data.carKm) > 0 && Number(data.carPassengers) > 0) {
    carCO2 =
      data.carType === "electric"
        ? Math.round(
            ((Number(data.carKm) * CO2_PER_KM.car) /
              Number(data.carPassengers)) *
              0.25,
          )
        : (Number(data.carKm) * CO2_PER_KM.car) / Number(data.carPassengers);
  }

  // NEW: Food calculation with days
  const foodPerDay = FOOD_CO2_PER_DAY[data.food] || 0;
  const foodCO2 = days * foodPerDay;

  // NEW: Accommodation calculation (verwendet das gleiche 'days')
  const categoryCO2 = ACCOMMODATION_CO2[data.accommodationCategory] || 0;
  const electricityCO2 = ELECTRICITY_CO2[data.electricity] || 0;
  const occupancyDivisor = ROOM_OCCUPANCY_DIVISOR[data.roomOccupancy] || 1;

  const accommodationCO2 =
    ((days + 1) * (categoryCO2 + electricityCO2)) / occupancyDivisor;

  let activityCO2 = 0;
  if (projectActivityTransport) {
    activityCO2 += (projectActivityTransport.boat || 0) * 0.5;
    activityCO2 += (projectActivityTransport.bus || 0) * CO2_PER_KM.bus;
    activityCO2 += (projectActivityTransport.train || 0) * CO2_PER_KM.train;
    activityCO2 += (projectActivityTransport.car || 0) * CO2_PER_KM.car;
  }
  const total =
    flightCO2 +
    trainCO2 +
    busCO2 +
    carCO2 +
    foodCO2 +
    accommodationCO2 +
    activityCO2;
  return {
    flightCO2,
    trainCO2,
    busCO2,
    carCO2,
    foodCO2,
    accommodationCO2,
    activityCO2,
    total,
    treesPerYear: total / TREE_CALCULATIONS.co2PerTreePerYear,
    treesToPlant:
      total /
      (TREE_CALCULATIONS.co2PerTreePerYear * TREE_CALCULATIONS.treeLifespan),
  };
}

function calculateLiveCO2(
  data,
  stepKey,
  stepValue,
  projectActivityTransport = null,
) {
  const tempData = { ...data, [stepKey]: stepValue };
  let liveCO2 = 0;
  if (tempData.flightKm)
    liveCO2 += Number(tempData.flightKm) * CO2_PER_KM.flight;
  if (tempData.trainKm) liveCO2 += Number(tempData.trainKm) * CO2_PER_KM.train;
  if (tempData.busKm) liveCO2 += Number(tempData.busKm) * CO2_PER_KM.bus;
  if (tempData.carKm && tempData.carPassengers) {
    let carCO2 =
      (Number(tempData.carKm) * CO2_PER_KM.car) /
      Number(tempData.carPassengers);
    if (tempData.carType === "electric") carCO2 *= 0.25;
    liveCO2 += carCO2;
  }

  // NEW: Food calculation with days
  if (tempData.food && tempData.days) {
    const days = Number(tempData.days) || 0;
    const foodPerDay = FOOD_CO2_PER_DAY[tempData.food] || 0;
    liveCO2 += days * foodPerDay;
  }

  // NEW: Accommodation calculation
  if (
    tempData.accommodationCategory &&
    tempData.electricity &&
    tempData.roomOccupancy
  ) {
    const days = Number(tempData.days) || 0;
    const categoryCO2 = ACCOMMODATION_CO2[tempData.accommodationCategory] || 0;
    const electricityCO2 = ELECTRICITY_CO2[tempData.electricity] || 0;
    const occupancyDivisor =
      ROOM_OCCUPANCY_DIVISOR[tempData.roomOccupancy] || 1;
    liveCO2 += ((days + 1) * (categoryCO2 + electricityCO2)) / occupancyDivisor;
  }

  if (projectActivityTransport) {
    liveCO2 +=
      (projectActivityTransport.boat || 0) * 0.5 +
      (projectActivityTransport.bus || 0) * CO2_PER_KM.bus +
      (projectActivityTransport.train || 0) * CO2_PER_KM.train +
      (projectActivityTransport.car || 0) * CO2_PER_KM.car;
  }
  return liveCO2;
}

// ========================================
// GLOBAL COUNTRY FLAG FUNCTION (CSS Icons)
// ========================================
function getCountryFlag(country, size = "16px") {
  const codes = {
    Germany: "de",
    France: "fr",
    Italy: "it",
    Spain: "es",
    Portugal: "pt",
    Netherlands: "nl",
    Belgium: "be",
    Austria: "at",
    Switzerland: "ch",
    Poland: "pl",
    "Czech Republic": "cz",
    Hungary: "hu",
    Slovakia: "sk",
    Slovenia: "si",
    Croatia: "hr",
    Greece: "gr",
    Denmark: "dk",
    Sweden: "se",
    Norway: "no",
    Finland: "fi",
    Ireland: "ie",
    "United Kingdom": "gb",
    Bulgaria: "bg",
    Romania: "ro",
  };

  const code = codes[country];
  if (!code) {
    return <span style={{ fontSize: size, marginRight: "4px" }}>🏴</span>;
  }

  return (
    <span
      className={`fi fi-${code}`}
      style={{
        fontSize: size,
        marginRight: "6px",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  );
}

function getActiveSteps(data) {
  return steps.filter(
    (step) =>
      !step.conditional ||
      (step.dependsOn === "carKm" && Number(data.carKm) > 0),
  );
}

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// ========================================
// USER SELECTION COMPONENT
// ========================================

function UserSelection({ organizationId, onUserSelected }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem(`employees_${organizationId}`);
    if (data) setEmployees(JSON.parse(data));
  }, [organizationId]);

  const handleContinue = () => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }
    const emp = employees.find((e) => e.id === selectedUserId);
    if (emp) {
      sessionStorage.setItem("currentEmployeeId", selectedUserId);
      onUserSelected(emp);
    }
  };

  const org = JSON.parse(
    localStorage.getItem(`organization_${organizationId}`) || "{}",
  );

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
          🌱 Welcome back
        </h1>
        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
          {org.name}
        </p>
        <p style={{ fontSize: "18px", color: "#666" }}>Who are you?</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => setSelectedUserId(emp.id)}
            style={{
              padding: "30px",
              border:
                selectedUserId === emp.id
                  ? "3px solid #28a745"
                  : "2px solid #ddd",
              borderRadius: "10px",
              cursor: "pointer",
              textAlign: "center",
              backgroundColor: selectedUserId === emp.id ? "#f0fff4" : "white",
              transition: "all 0.2s",
              boxShadow:
                selectedUserId === emp.id
                  ? "0 4px 12px rgba(40, 167, 69, 0.2)"
                  : "none",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "15px" }}>👤</div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {emp.firstName} {emp.lastName}
            </div>
            <div style={{ marginBottom: "10px" }}>
              {emp.systemRole === "admin" ? (
                <span
                  style={{
                    padding: "5px 15px",
                    backgroundColor: "#ffc107",
                    color: "#333",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  🔑 Admin
                </span>
              ) : (
                <span
                  style={{
                    padding: "5px 15px",
                    backgroundColor: "#e9ecef",
                    color: "#666",
                    borderRadius: "20px",
                    fontSize: "14px",
                  }}
                >
                  Team Member
                </span>
              )}
            </div>
            {org.primaryAdmin === emp.id && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                ⭐ Primary Admin
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleContinue}
          disabled={!selectedUserId}
          style={{
            padding: "15px 50px",
            fontSize: "18px",
            fontWeight: "bold",
            backgroundColor: selectedUserId ? "#28a745" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: selectedUserId ? "pointer" : "not-allowed",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ========================================
// EXPANDABLE EMPLOYEE CARD COMPONENT
// ========================================

function ExpandableEmployeeCard({
  emp,
  index,
  projects,
  getCppdColor,
  getCppdBarColor,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const empProjects = projects.filter((p) => p.employeeId === emp.id);
  const maxCppd = Math.max(emp.cppd, 20); // Dynamic max or fallback to 20
  const barWidth = maxCppd > 0 ? (emp.cppd / maxCppd) * 100 : 0;

  return (
    <div
      style={{
        marginBottom: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Main Employee Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "15px",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f8f9fa")
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div style={{ fontSize: "24px", marginRight: "15px" }}>
            {index === 0 && "🏆"}
            {index === 1 && "🥈"}
            {index === 2 && "🥉"}
            {index > 2 && `#${index + 1}`}
          </div>
          <div style={{ flex: 1, fontSize: "18px", fontWeight: "bold" }}>
            {emp.firstName} {emp.lastName} {emp.systemRole === "admin" && "🔑"}
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#28a745",
              marginRight: "15px",
            }}
          >
            {emp.cppd} kg/p/day {getCppdColor(emp.cppd)}
          </div>
          <div style={{ fontSize: "24px", color: "#666" }}>
            {isExpanded ? "▼" : "▶"}
          </div>
        </div>

        <div
          style={{
            height: "10px",
            backgroundColor: "#e9ecef",
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              background: getCppdBarColor(emp.cppd),
              transition: "width 0.5s",
            }}
          />
        </div>

        <div style={{ fontSize: "14px", color: "#666" }}>
          {emp.projectCount} project{emp.projectCount !== 1 ? "s" : ""} |{" "}
          {emp.totalParticipants} participants | {emp.totalCO2.toFixed(1)} kg
          CO₂
        </div>
      </div>

      {/* Expanded Projects Section */}
      {isExpanded && empProjects.length > 0 && (
        <div
          style={{
            padding: "15px 15px 20px 15px",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #e9ecef",
          }}
        >
          <h4 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#666" }}>
            📋 Projects ({empProjects.length})
          </h4>

          <div style={{ display: "grid", gap: "12px" }}>
            {empProjects.map((project) => {
              const projectParticipants = JSON.parse(
                localStorage.getItem(`participants_${project.id}`) || "[]",
              );
              const projectCO2 = projectParticipants.reduce(
                (sum, p) => sum + (p.result?.total || 0),
                0,
              );
              const projectParticipantDays = projectParticipants.reduce(
                (sum, p) => sum + (Number(p.data?.days) || 0),
                0,
              );
              const projectCppd =
                projectParticipantDays > 0
                  ? projectCO2 / projectParticipantDays
                  : 0;

              return (
                <div
                  key={project.id}
                  style={{
                    padding: "12px 15px",
                    backgroundColor: "white",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          marginBottom: "4px",
                        }}
                      >
                        {project.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        📅 {project.start} → {project.end}
                      </div>
                      {project.location && (
                        <div style={{ fontSize: "13px", color: "#666" }}>
                          📍 {project.location},{" "}
                          {getCountryFlag(project.country, "14px")}{" "}
                          {project.country}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        minWidth: "120px",
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "6px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color:
                            projectCppd <= 6
                              ? "#28a745"
                              : projectCppd <= 10
                                ? "#ffc107"
                                : projectCppd <= 15
                                  ? "#fd7e14"
                                  : "#dc3545",
                        }}
                      >
                        {projectCppd.toFixed(1)} kg/p/day
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginTop: "2px",
                        }}
                      >
                        {getCppdColor(projectCppd)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      fontSize: "12px",
                      color: "#666",
                      paddingTop: "8px",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <span>👥 {projectParticipants.length} participants</span>
                    <span>📊 {projectParticipantDays} participant-days</span>
                    <span>🏭 {projectCO2.toFixed(1)} kg CO₂</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// ORGANIZATION DASHBOARD (VOLLSTÄNDIG MIT BENCHMARKS & RANKINGS!)
// ========================================

function OrganizationDashboard({ organizationId }) {
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    totalParticipants: 0,
    totalCO2: 0,
    totalTreesYear: 0,
    totalTreesPlant: 0,
    avgCppd: 0,
  });
  const [employeeStats, setEmployeeStats] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [projs, setProjs] = useState([]);

  useEffect(() => {
    const orgData = localStorage.getItem(`organization_${organizationId}`);
    if (orgData) setOrganization(JSON.parse(orgData));

    const empData = localStorage.getItem(`employees_${organizationId}`);
    const emps = empData ? JSON.parse(empData) : [];

    const projData = localStorage.getItem(`projects_${organizationId}`);
    const projsData = projData ? JSON.parse(projData) : [];
    setProjs(projsData);

    let totalParticipants = 0,
      totalCO2 = 0,
      totalParticipantDays = 0;

    projsData.forEach((project) => {
      const participants = JSON.parse(
        localStorage.getItem(`participants_${project.id}`) || "[]",
      );
      const projectCO2 = participants.reduce(
        (sum, p) => sum + p.result.total,
        0,
      );
      totalCO2 += projectCO2;
      totalParticipants += participants.length;
      // NEW: Use actual participant days instead of project duration
      const projectParticipantDays = participants.reduce(
        (sum, p) => sum + (Number(p.data?.days) || 0),
        0,
      );
      totalParticipantDays += projectParticipantDays;
    });

    const avgCppd =
      totalParticipantDays > 0 ? totalCO2 / totalParticipantDays : 0;
    const totalTreesYear = totalCO2 / TREE_CALCULATIONS.co2PerTreePerYear;
    const totalTreesPlant =
      totalCO2 /
      (TREE_CALCULATIONS.co2PerTreePerYear * TREE_CALCULATIONS.treeLifespan);

    setStats({
      totalEmployees: emps.length,
      totalProjects: projsData.length,
      totalParticipants,
      totalCO2,
      totalTreesYear,
      totalTreesPlant,
      avgCppd: parseFloat(avgCppd.toFixed(1)),
    });

    // Calculate employee stats
    const empStats = [];
    emps.forEach((emp) => {
      const empProjects = projsData.filter((p) => p.employeeId === emp.id);
      let totalCO2 = 0,
        totalParticipants = 0,
        totalParticipantDays = 0;
      empProjects.forEach((project) => {
        const participants = JSON.parse(
          localStorage.getItem(`participants_${project.id}`) || "[]",
        );
        const projectCO2 = participants.reduce(
          (sum, p) => sum + p.result.total,
          0,
        );
        totalCO2 += projectCO2;
        totalParticipants += participants.length;
        // NEW: Use actual participant days instead of project duration
        const projectParticipantDays = participants.reduce(
          (sum, p) => sum + (Number(p.data?.days) || 0),
          0,
        );
        totalParticipantDays += projectParticipantDays;
      });
      const cppd =
        totalParticipantDays > 0 ? totalCO2 / totalParticipantDays : 0;
      empStats.push({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        systemRole: emp.systemRole,
        projectCount: empProjects.length,
        totalParticipants,
        totalCO2,
        cppd: parseFloat(cppd.toFixed(1)),
      });
    });

    empStats.sort((a, b) => {
      if (a.cppd === 0 && b.cppd === 0) return 0;
      if (a.cppd === 0) return 1;
      if (b.cppd === 0) return -1;
      return a.cppd - b.cppd;
    });
    setEmployeeStats(empStats);

    // Calculate benchmarks
    if (projsData.length < 3) {
      setBenchmarks({
        q1: 6,
        q2: 10,
        q3: 15,
        type: "static",
        projectCount: projsData.length,
        message: "Based on industry standards (min. 3 projects needed)",
      });
    } else {
      const cppdValues = [];
      projsData.forEach((project) => {
        const participants = JSON.parse(
          localStorage.getItem(`participants_${project.id}`) || "[]",
        );
        if (participants.length === 0) return;
        const totalCO2 = participants.reduce(
          (sum, p) => sum + p.result.total,
          0,
        );
        // NEW: Use actual participant days instead of project duration
        const participantDays = participants.reduce(
          (sum, p) => sum + (Number(p.data?.days) || 0),
          0,
        );
        if (participantDays > 0) cppdValues.push(totalCO2 / participantDays);
      });

      if (cppdValues.length > 0) {
        cppdValues.sort((a, b) => a - b);
        const percentile = (arr, p) => {
          const index = (p / 100) * (arr.length - 1);
          const lower = Math.floor(index);
          const upper = Math.ceil(index);
          const weight = index % 1;
          if (lower === upper) return arr[lower];
          return arr[lower] * (1 - weight) + arr[upper] * weight;
        };
        const avg = cppdValues.reduce((a, b) => a + b, 0) / cppdValues.length;
        setBenchmarks({
          q1: parseFloat(percentile(cppdValues, 25).toFixed(1)),
          q2: parseFloat(percentile(cppdValues, 50).toFixed(1)),
          q3: parseFloat(percentile(cppdValues, 75).toFixed(1)),
          avg: parseFloat(avg.toFixed(1)),
          type: "dynamic",
          projectCount: cppdValues.length,
          message: `Based on ${cppdValues.length} projects`,
        });
      }
    }
  }, [organizationId]);

  const getCppdColor = (cppd) => {
    if (!benchmarks || cppd === 0) return "⚪";
    if (cppd <= benchmarks.q1) return "🟢";
    if (cppd <= benchmarks.q2) return "🟡";
    if (cppd <= benchmarks.q3) return "🟠";
    return "🔴";
  };

  const getCppdBarColor = (cppd) => {
    if (!benchmarks) return "#ccc";
    if (cppd <= benchmarks.q1)
      return "linear-gradient(45deg, #28a745, #20c997)";
    if (cppd <= benchmarks.q2)
      return "linear-gradient(45deg, #ffc107, #ff9800)";
    if (cppd <= benchmarks.q3)
      return "linear-gradient(45deg, #fd7e14, #f57c00)";
    return "linear-gradient(45deg, #dc3545, #c82333)";
  };

  if (!organization)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );

  return (
    <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "5px" }}>
        📊 Organization Dashboard
      </h1>
      <p style={{ fontSize: "18px", color: "#666", marginBottom: "30px" }}>
        {organization.name}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            padding: "25px",
            backgroundColor: "#e3f2fd",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px" }}>👥</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>
            {stats.totalEmployees}
          </div>
          <div style={{ color: "#666" }}>Team Members</div>
        </div>
        <div
          style={{
            padding: "25px",
            backgroundColor: "#f3e5f5",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px" }}>📋</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>
            {stats.totalProjects}
          </div>
          <div style={{ color: "#666" }}>Projects</div>
        </div>
        <div
          style={{
            padding: "25px",
            backgroundColor: "#e8f5e9",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px" }}>🌍</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>
            {stats.totalParticipants}
          </div>
          <div style={{ color: "#666" }}>Participants</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
          padding: "25px",
          backgroundColor: "#fff3e0",
          borderRadius: "10px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "30px" }}>🏭</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>
            {stats.totalCO2.toFixed(1)} kg
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Total CO₂</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "30px" }}>📉</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>
            {stats.avgCppd} kg/p/day
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Avg CppD</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "30px" }}>🌳</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>
            {Math.ceil(stats.totalTreesYear)}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Trees (1 year)</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "30px" }}>🌱</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>
            {Math.ceil(stats.totalTreesPlant)}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Trees to plant</div>
        </div>
      </div>

      {benchmarks && (
        <div
          style={{
            padding: "25px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <h3>📊 Your CppD Benchmarks</h3>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
            {benchmarks.message}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "#d4edda",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "30px" }}>🟢</div>
              <div style={{ fontWeight: "bold" }}>Excellent</div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {benchmarks.type === "dynamic" ? `< ${benchmarks.q1}` : "< 6"}{" "}
                kg
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>Top 25%</div>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "#fff3cd",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "30px" }}>🟡</div>
              <div style={{ fontWeight: "bold" }}>Good</div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {benchmarks.type === "dynamic"
                  ? `${benchmarks.q1}-${benchmarks.q2}`
                  : "6-10"}{" "}
                kg
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Above Average
              </div>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "#ffe5cc",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "30px" }}>🟠</div>
              <div style={{ fontWeight: "bold" }}>Average</div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {benchmarks.type === "dynamic"
                  ? `${benchmarks.q2}-${benchmarks.q3}`
                  : "10-15"}{" "}
                kg
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Below Average
              </div>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8d7da",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "30px" }}>🔴</div>
              <div style={{ fontWeight: "bold" }}>Needs Work</div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {benchmarks.type === "dynamic" ? `> ${benchmarks.q3}` : "> 15"}{" "}
                kg
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>Bottom 25%</div>
            </div>
          </div>
          <div
            style={{
              padding: "15px",
              backgroundColor: "white",
              borderRadius: "8px",
              textAlign: "center",
              border: "2px solid #28a745",
            }}
          >
            <span>Your Org Average: </span>
            <strong style={{ fontSize: "20px", color: "#28a745" }}>
              {stats.avgCppd} kg/p/day {getCppdColor(stats.avgCppd)}
            </strong>
          </div>
        </div>
      )}

      {employeeStats.length > 0 && (
        <div
          style={{
            padding: "25px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <h3>📉 CppD Efficiency Ranking</h3>
          {employeeStats
            .filter((e) => e.cppd > 0)
            .map((emp, index) => (
              <ExpandableEmployeeCard
                key={emp.id}
                emp={emp}
                index={index}
                projects={projs}
                getCppdColor={getCppdColor}
                getCppdBarColor={getCppdBarColor}
              />
            ))}
          {employeeStats.filter((e) => e.cppd === 0).length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#fff3cd",
                borderRadius: "8px",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Team members without projects:
              </p>
              {employeeStats
                .filter((e) => e.cppd === 0)
                .map((emp) => (
                  <span
                    key={emp.id}
                    style={{
                      display: "inline-block",
                      padding: "5px 15px",
                      backgroundColor: "white",
                      borderRadius: "20px",
                      marginRight: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    {emp.firstName} {emp.lastName}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========================================
// ADD/EDIT TEAM MEMBER MODAL
// ========================================

function TeamMemberModal({
  isOpen,
  onClose,
  onSave,
  member = null,
  organizationId,
  currentUser,
  isPrimaryAdmin,
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    systemRole: "member",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        systemRole: member.systemRole || "member",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        systemRole: "member",
      });
    }
    setErrors({});
  }, [member, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const memberData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      id: member?.id || generateId("emp"),
      addedAt: member?.addedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(memberData);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          maxWidth: "500px",
          width: "100%",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "28px" }}>
            {member ? "✏️ Edit Team Member" : "➕ Add Team Member"}
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#999",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: errors.firstName
                  ? "2px solid #dc3545"
                  : "1px solid #ddd",
              }}
              placeholder="Enter first name"
              autoFocus
            />
            {errors.firstName && (
              <div
                style={{ color: "#dc3545", fontSize: "14px", marginTop: "5px" }}
              >
                {errors.firstName}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: errors.lastName
                  ? "2px solid #dc3545"
                  : "1px solid #ddd",
              }}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <div
                style={{ color: "#dc3545", fontSize: "14px", marginTop: "5px" }}
              >
                {errors.lastName}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Role
            </label>
            <select
              name="systemRole"
              value={formData.systemRole}
              onChange={handleChange}
              disabled={
                member && isPrimaryAdmin && member.id === currentUser.id
              }
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
                cursor:
                  member && isPrimaryAdmin && member.id === currentUser.id
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <option value="member">Team Member</option>
              <option value="admin">Admin 🔑</option>
            </select>
            {member && isPrimaryAdmin && member.id === currentUser.id && (
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                ℹ️ Primary Admin role cannot be changed
              </div>
            )}
          </div>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginBottom: "25px",
            }}
          >
            <div style={{ fontSize: "14px", marginBottom: "10px" }}>
              <strong>Team Member:</strong> Can view projects and data
            </div>
            <div style={{ fontSize: "14px" }}>
              <strong>Admin 🔑:</strong> Can manage team, create projects, and
              view all data
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {member ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// DELETE CONFIRMATION MODAL
// ========================================

function DeleteMemberModal({ isOpen, onClose, onConfirm, member }) {
  if (!isOpen || !member) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          maxWidth: "450px",
          width: "100%",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>⚠️</div>
        <h2 style={{ marginBottom: "15px", fontSize: "24px" }}>
          Delete Team Member?
        </h2>
        <p
          style={{ marginBottom: "10px", fontSize: "18px", fontWeight: "bold" }}
        >
          {member.firstName} {member.lastName}
        </p>
        <p style={{ marginBottom: "25px", fontSize: "14px", color: "#666" }}>
          This action cannot be undone. The member will be permanently removed
          from your organization.
        </p>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(member.id);
              onClose();
            }}
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Delete Member
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// UPDATED TEAM MANAGEMENT COMPONENT
// ========================================

function TeamManagementComplete({ organizationId, currentUserId }) {
  const [employees, setEmployees] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);

  useEffect(() => {
    loadData();
  }, [organizationId, currentUserId]);

  const loadData = () => {
    const orgData = localStorage.getItem(`organization_${organizationId}`);
    if (orgData) setOrganization(JSON.parse(orgData));

    const empData = localStorage.getItem(`employees_${organizationId}`);
    if (empData) {
      const emps = JSON.parse(empData);
      setEmployees(emps);
      setCurrentUser(emps.find((e) => e.id === currentUserId));
    }
  };

  const isCurrentUserAdmin = currentUser?.systemRole === "admin";
  const isPrimaryAdmin = organization?.primaryAdmin === currentUserId;

  const handleSaveMember = (memberData) => {
    const existingEmployees = JSON.parse(
      localStorage.getItem(`employees_${organizationId}`) || "[]",
    );

    if (editingMember) {
      // Update existing member
      const updatedEmployees = existingEmployees.map((e) =>
        e.id === memberData.id ? memberData : e,
      );
      localStorage.setItem(
        `employees_${organizationId}`,
        JSON.stringify(updatedEmployees),
      );
      setEmployees(updatedEmployees);
    } else {
      // Add new member
      const newEmployees = [...existingEmployees, memberData];
      localStorage.setItem(
        `employees_${organizationId}`,
        JSON.stringify(newEmployees),
      );
      setEmployees(newEmployees);
    }

    setIsAddModalOpen(false);
    setEditingMember(null);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleDeleteMember = (memberId) => {
    // Cannot delete primary admin
    if (organization?.primaryAdmin === memberId) {
      alert("Cannot delete the primary admin!");
      return;
    }

    const updatedEmployees = employees.filter((e) => e.id !== memberId);
    localStorage.setItem(
      `employees_${organizationId}`,
      JSON.stringify(updatedEmployees),
    );
    setEmployees(updatedEmployees);
  };

  const handleMakeAdmin = (memberId) => {
    const updatedEmployees = employees.map((e) =>
      e.id === memberId
        ? { ...e, systemRole: "admin", updatedAt: new Date().toISOString() }
        : e,
    );
    localStorage.setItem(
      `employees_${organizationId}`,
      JSON.stringify(updatedEmployees),
    );
    setEmployees(updatedEmployees);
  };

  const handleRemoveAdmin = (memberId) => {
    // Cannot remove primary admin
    if (organization?.primaryAdmin === memberId) {
      alert("Cannot remove admin role from primary admin!");
      return;
    }

    const updatedEmployees = employees.map((e) =>
      e.id === memberId
        ? { ...e, systemRole: "member", updatedAt: new Date().toISOString() }
        : e,
    );
    localStorage.setItem(
      `employees_${organizationId}`,
      JSON.stringify(updatedEmployees),
    );
    setEmployees(updatedEmployees);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ margin: 0 }}>👥 Team Members ({employees.length})</h2>
        {isCurrentUserAdmin && (
          <button
            onClick={() => {
              setEditingMember(null);
              setIsAddModalOpen(true);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Team Member
          </button>
        )}
      </div>

      {!isCurrentUserAdmin && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#d1ecf1",
            color: "#0c5460",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #bee5eb",
          }}
        >
          ℹ️ Only admins can add or manage team members
        </div>
      )}

      <div style={{ display: "grid", gap: "15px" }}>
        {employees.map((emp) => {
          const isCurrentUserCard = emp.id === currentUserId;
          const isPrimaryAdminCard = organization?.primaryAdmin === emp.id;
          const canDelete = isCurrentUserAdmin && !isPrimaryAdminCard;
          const canChangeRole = isCurrentUserAdmin && !isPrimaryAdminCard;

          return (
            <div
              key={emp.id}
              style={{
                padding: "20px",
                backgroundColor: "white",
                border: isCurrentUserCard
                  ? "3px solid #ffc107"
                  : "2px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      👤 {emp.firstName} {emp.lastName}
                    </span>
                    {isCurrentUserCard && (
                      <span
                        style={{
                          padding: "3px 10px",
                          backgroundColor: "#ffc107",
                          borderRadius: "15px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        ⭐ YOU
                      </span>
                    )}
                    {emp.systemRole === "admin" && (
                      <span style={{ fontSize: "20px" }} title="Admin">
                        🔑
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    <strong>
                      {emp.systemRole === "admin" ? "Admin" : "Team Member"}
                    </strong>
                    {isPrimaryAdminCard && " | Primary Admin"}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "8px",
                    }}
                  >
                    Added: {new Date(emp.addedAt).toLocaleDateString()}
                    {emp.updatedAt && emp.updatedAt !== emp.addedAt && (
                      <>
                        {" "}
                        | Updated:{" "}
                        {new Date(emp.updatedAt).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>

                {isCurrentUserAdmin && (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => handleEditMember(emp)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      ✏️ Edit
                    </button>

                    {canChangeRole && (
                      <>
                        {emp.systemRole === "member" ? (
                          <button
                            onClick={() => handleMakeAdmin(emp.id)}
                            style={{
                              padding: "8px 15px",
                              backgroundColor: "#ffc107",
                              color: "#333",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                          >
                            🔑 Make Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveAdmin(emp.id)}
                            style={{
                              padding: "8px 15px",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                          >
                            Remove Admin
                          </button>
                        )}
                      </>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => setDeletingMember(emp)}
                        style={{
                          padding: "8px 15px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isPrimaryAdminCard && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    borderRadius: "5px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    border: "1px solid #ffeaa7",
                  }}
                >
                  ⭐ Primary Admin - Cannot be deleted or demoted
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember}
        organizationId={organizationId}
        currentUser={currentUser}
        isPrimaryAdmin={isPrimaryAdmin}
      />

      <DeleteMemberModal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
        member={deletingMember}
      />
    </div>
  );
}

// ========================================
// PROJECT FORM MODAL COMPONENT
// ========================================

function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  project = null,
  organizationId,
  currentUserId,
  employees,
}) {
  const [formData, setFormData] = useState({
    name: "",
    start: "",
    end: "",
    location: "",
    country: "",
    employeeId: currentUserId,
    welcomeMessage: "",
    activityTransport: {
      boat: 0,
      bus: 0,
      train: 0,
      car: 0,
    },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        start: project.start || "",
        end: project.end || "",
        location: project.location || "",
        country: project.country || "",
        employeeId: project.employeeId || currentUserId,
        welcomeMessage: project.welcomeMessage || "",
        activityTransport: project.activityTransport || {
          boat: 0,
          bus: 0,
          train: 0,
          car: 0,
        },
      });
    } else {
      setFormData({
        name: "",
        start: "",
        end: "",
        location: "",
        country: "",
        employeeId: currentUserId,
        welcomeMessage: "",
        activityTransport: { boat: 0, bus: 0, train: 0, car: 0 },
      });
    }
    setErrors({});
  }, [project, isOpen, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleActivityTransportChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      activityTransport: {
        ...prev.activityTransport,
        [type]: Number(value) || 0,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.start) newErrors.start = "Start date is required";
    if (!formData.end) newErrors.end = "End date is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (
      formData.start &&
      formData.end &&
      new Date(formData.start) > new Date(formData.end)
    ) {
      newErrors.end = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const employee = employees.find((e) => e.id === formData.employeeId);
    const projectData = {
      ...formData,
      employeeName: employee
        ? `${employee.firstName} ${employee.lastName}`
        : "Unknown",
      id: project?.id || generateId("proj"),
      organizationId,
      createdAt: project?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(projectData);
  };

  if (!isOpen) return null;

  const countries = [
    "Austria",
    "Belgium",
    "Bulgaria",
    "Croatia",
    "Czech Republic",
    "Denmark",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Ireland",
    "Italy",
    "Netherlands",
    "Norway",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland",
    "United Kingdom",
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "28px" }}>
            {project ? "📝 Edit Project" : "➕ Create New Project"}
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#999",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: errors.name ? "2px solid #dc3545" : "1px solid #ddd",
              }}
              placeholder="e.g., Summer Youth Exchange 2025"
            />
            {errors.name && (
              <div
                style={{ color: "#dc3545", fontSize: "14px", marginTop: "5px" }}
              >
                {errors.name}
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Start Date *
              </label>
              <input
                type="date"
                name="start"
                value={formData.start}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: errors.start ? "2px solid #dc3545" : "1px solid #ddd",
                }}
              />
              {errors.start && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                >
                  {errors.start}
                </div>
              )}
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                End Date *
              </label>
              <input
                type="date"
                name="end"
                value={formData.end}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: errors.end ? "2px solid #dc3545" : "1px solid #ddd",
                }}
              />
              {errors.end && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                >
                  {errors.end}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
              placeholder="e.g., Berlin, Munich..."
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Country *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: errors.country ? "2px solid #dc3545" : "1px solid #ddd",
              }}
            >
              <option value="">-- Select a country --</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {getCountryFlag(c)} {c}
                </option>
              ))}
            </select>
            {errors.country && (
              <div
                style={{ color: "#dc3545", fontSize: "14px", marginTop: "5px" }}
              >
                {errors.country}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Responsible Team Member
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}{" "}
                  {emp.systemRole === "admin" ? "🔑" : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Welcome Message (optional)
            </label>
            <textarea
              name="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
                fontFamily: "inherit",
              }}
              placeholder="A personal welcome message for participants..."
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
              🎯 Project Activity Transport (optional)
            </h3>
            <p
              style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}
            >
              Enter kilometers for activities during the project (e.g.,
              excursions, field trips)
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  🛥️ Boat (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activityTransport.boat}
                  onChange={(e) =>
                    handleActivityTransportChange("boat", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  🚌 Bus (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activityTransport.bus}
                  onChange={(e) =>
                    handleActivityTransportChange("bus", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  🚆 Train (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activityTransport.train}
                  onChange={(e) =>
                    handleActivityTransportChange("train", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  🚗 Car (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activityTransport.car}
                  onChange={(e) =>
                    handleActivityTransportChange("car", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {project ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// PROJECT LINK COMPONENT
// ========================================

function ProjectLink({ projectId }) {
  const [copied, setCopied] = useState(false);

  // Generate the participant link
  const baseUrl = window.location.origin;
  const participantLink = `${baseUrl}?project=${projectId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(participantLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "#e8f5e9",
        borderRadius: "8px",
        marginTop: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#2e7d32" }}>
          🔗 Participant Link
        </div>
        <button
          onClick={copyToClipboard}
          style={{
            padding: "6px 12px",
            backgroundColor: copied ? "#28a745" : "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "📋 Copy Link"}
        </button>
      </div>
      <input
        type="text"
        value={participantLink}
        readOnly
        onClick={(e) => e.target.select()}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "13px",
          border: "1px solid #a5d6a7",
          borderRadius: "5px",
          backgroundColor: "white",
          fontFamily: "monospace",
          cursor: "pointer",
        }}
      />
      <div style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>
        💡 Share this link with participants to let them calculate their CO₂
        footprint
      </div>
    </div>
  );
}

// ========================================
// UPDATED PROJECT CARD WITH DETAILS BUTTON
// ========================================

function ProjectCardWithDetails({
  project,
  onEdit,
  onDelete,
  onShowQR,
  onShowDetails,
  participantCount,
}) {
  const [showLink, setShowLink] = useState(false);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        border: "2px solid #ddd",
        borderRadius: "10px",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      <h3
        style={{ marginBottom: "15px", fontSize: "20px", paddingRight: "60px" }}
      >
        {project.name}
      </h3>

      <div style={{ marginBottom: "15px", color: "#666" }}>
        <div style={{ marginBottom: "8px" }}>
          📅 {project.start} → {project.end}
        </div>
        {project.location && (
          <div style={{ marginBottom: "8px" }}>
            📍 {project.location}, {getCountryFlag(project.country)}{" "}
            {project.country}
          </div>
        )}
        {!project.location && (
          <div style={{ marginBottom: "8px" }}>
            🌍 {getCountryFlag(project.country)} {project.country}
          </div>
        )}
        <div style={{ marginBottom: "8px" }}>👤 {project.employeeName}</div>
        <div style={{ marginBottom: "8px" }}>
          👥 {participantCount} participant{participantCount !== 1 ? "s" : ""}
        </div>
      </div>

      {(project.activityTransport?.boat > 0 ||
        project.activityTransport?.bus > 0 ||
        project.activityTransport?.train > 0 ||
        project.activityTransport?.car > 0) && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#666",
            }}
          >
            🎯 Activities
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            {project.activityTransport.boat > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "12px",
                }}
              >
                🛥️ {project.activityTransport.boat}km
              </span>
            )}
            {project.activityTransport.bus > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "12px",
                }}
              >
                🚌 {project.activityTransport.bus}km
              </span>
            )}
            {project.activityTransport.train > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#f3e5f5",
                  borderRadius: "12px",
                }}
              >
                🚆 {project.activityTransport.train}km
              </span>
            )}
            {project.activityTransport.car > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "12px",
                }}
              >
                🚗 {project.activityTransport.car}km
              </span>
            )}
          </div>
        </div>
      )}

      {/* Link Section */}
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={() => setShowLink(!showLink)}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {showLink ? "▼" : "▶"} {showLink ? "Hide" : "Show"} Participant Link
        </button>
        {showLink && <ProjectLink projectId={project.id} />}
      </div>

      {/* Action Buttons - Updated Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        <button
          onClick={() => onShowDetails(project)}
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          📊 Details
        </button>
        <button
          onClick={() => onShowQR(project)}
          style={{
            padding: "10px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          📱 QR Code
        </button>
        <button
          onClick={() => onEdit(project)}
          style={{
            padding: "10px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          style={{
            padding: "10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          🗑️ Delete
        </button>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#999",
          marginTop: "15px",
          paddingTop: "15px",
          borderTop: "1px solid #eee",
        }}
      >
        ID: {project.id}
      </div>
    </div>
  );
}

// ========================================
// QR CODE MODAL
// ========================================

function QRCodeModal({ isOpen, onClose, project }) {
  if (!isOpen || !project) return null;

  const participantLink = `${window.location.origin}?project=${project.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(participantLink)}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${project.name.replace(/[^a-z0-9]/gi, "_")}_QRCode.png`;
    link.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          maxWidth: "500px",
          width: "100%",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px" }}>📱 QR Code</h2>
          <button
            onClick={onClose}
            style={{
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#999",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
            {project.name}
          </h3>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            📅 {project.start} - {project.end}
          </p>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              display: "inline-block",
            }}
          >
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{ width: "300px", height: "300px", display: "block" }}
            />
          </div>

          <p
            style={{
              fontSize: "13px",
              color: "#666",
              marginTop: "15px",
              fontStyle: "italic",
            }}
          >
            Participants can scan this QR code to access the CO₂ calculator
          </p>
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#e8f5e9",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#2e7d32",
            }}
          >
            Link:
          </div>
          <input
            type="text"
            value={participantLink}
            readOnly
            onClick={(e) => e.target.select()}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "11px",
              border: "1px solid #a5d6a7",
              borderRadius: "5px",
              backgroundColor: "white",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={handleDownload}
            style={{
              padding: "12px 30px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            💾 Download QR Code
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 30px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Close
          </button>
        </div>

        <p style={{ fontSize: "11px", color: "#999", marginTop: "20px" }}>
          💡 Tip: Print this QR code and display it at your project venue
        </p>
      </div>
    </div>
  );
}

// ========================================
// LIVE PROJECT DETAILS VIEW
// ========================================

function LiveProjectDetailsView({ project, onClose, isLiveMode = false }) {
  const [participants, setParticipants] = useState([]);
  const [latestParticipant, setLatestParticipant] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // Default to newest first for live mode
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLive, setIsLive] = useState(isLiveMode);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [newParticipantId, setNewParticipantId] = useState(null);
  const [previousCount, setPreviousCount] = useState(0);

  // Calculate project days
  const projectDays = calculateProjectDays(project.start, project.end);

  // Load participants
  const loadParticipants = () => {
    if (project) {
      const data = localStorage.getItem(`participants_${project.id}`);
      if (data) {
        const newParticipants = JSON.parse(data);

        // Check if new participant added (for animation)
        if (newParticipants.length > participants.length) {
          const newIds = newParticipants.map((p) => p.id);
          const oldIds = participants.map((p) => p.id);
          const addedId = newIds.find((id) => !oldIds.includes(id));
          if (addedId) {
            setNewParticipantId(addedId);

            // ⭐ NEU: Set latest participant für isNew check
            const latestP = newParticipants.find((p) => p.id === addedId);
            if (latestP) {
              setLatestParticipant(latestP);
            }

            setTimeout(() => setNewParticipantId(null), 3000);
          }
        }

        setPreviousCount(participants.length);
        setParticipants(newParticipants);
        setLastUpdateTime(new Date());
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadParticipants();
  }, [project]);

  // Live update interval
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        loadParticipants();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isLive, project, participants]);

  // Optional notification sound
  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silently fail if audio not supported
    }
  };

  if (!project) return null;

  // Calculate project statistics
  const totalCO2 = participants.reduce(
    (sum, p) => sum + (p.result?.total || 0),
    0,
  );
  const avgCO2 = participants.length > 0 ? totalCO2 / participants.length : 0;

  // NEW: Use actual participant days instead of project duration
  const totalParticipantDays = participants.reduce((sum, p) => {
    return sum + (Number(p.data?.days) || 0);
  }, 0);
  const avgCO2PerDay =
    totalParticipantDays > 0 ? totalCO2 / totalParticipantDays : 0;

  // CO2 breakdown across all participants
  const totalBreakdown = {
    flightCO2: 0,
    trainCO2: 0,
    busCO2: 0,
    carCO2: 0,
    foodCO2: 0,
    accCO2: 0,
    energyCO2: 0,
    activityCO2: 0,
  };

  participants.forEach((p) => {
    if (p.result) {
      Object.keys(totalBreakdown).forEach((key) => {
        totalBreakdown[key] += p.result[key] || 0;
      });
    }
  });

  // Country breakdown
  const countryStats = {};
  participants.forEach((p) => {
    const country = p.data?.country || "Unknown";
    if (!countryStats[country]) {
      countryStats[country] = {
        count: 0,
        totalCO2: 0,
        avgCO2PerParticipantPerDay: 0,
      };
    }
    countryStats[country].count++;
    countryStats[country].totalCO2 += p.result?.total || 0;
  });

  // NEW: Calculate country-specific participant days
  participants.forEach((p) => {
    const country = p.data?.country || "Unknown";
    if (countryStats[country]) {
      countryStats[country].participantDays =
        (countryStats[country].participantDays || 0) +
        (Number(p.data?.days) || 0);
    }
  });

  Object.keys(countryStats).forEach((country) => {
    const participantDays = countryStats[country].participantDays || 0;
    countryStats[country].avgCO2PerParticipantPerDay =
      participantDays > 0
        ? countryStats[country].totalCO2 / participantDays
        : 0;
  });

  Object.keys(countryStats).forEach((country) => {
    const participantDays = countryStats[country].participantDays || 0;
    countryStats[country].avgCO2PerParticipantPerDay =
      participantDays > 0
        ? countryStats[country].totalCO2 / participantDays
        : 0;
  });

  const sortedCountries = Object.entries(countryStats).sort(
    (a, b) => b[1].avgCO2PerParticipantPerDay - a[1].avgCO2PerParticipantPerDay,
  );

  // Sort participants
  const sortedParticipants = [...participants].sort((a, b) => {
    let compareA, compareB;

    switch (sortBy) {
      case "name":
        compareA = (a.data?.firstName || "").toLowerCase();
        compareB = (b.data?.firstName || "").toLowerCase();
        break;
      case "co2":
        compareA = a.result?.total || 0;
        compareB = b.result?.total || 0;
        break;
      case "date":
        compareA = new Date(a.completedAt || 0).getTime();
        compareB = new Date(b.completedAt || 0).getTime();
        break;
      case "country":
        compareA = (a.data?.country || "Unknown").toLowerCase();
        compareB = (b.data?.country || "Unknown").toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          maxWidth: "1400px",
          width: "100%",
          maxHeight: "95vh",
          overflow: "auto",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "30px",
            borderBottom: "2px solid #e9ecef",
            paddingBottom: "20px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "10px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "32px" }}>📊 {project.name}</h2>
              {isLive && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 15px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "20px",
                    animation: "pulse 2s infinite",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      animation: "blink 1s infinite",
                    }}
                  ></span>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    LIVE
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize: "16px", color: "#666" }}>
              📅 {project.start} - {project.end} ({projectDays} days)
              {project.location && (
                <>
                  {" "}
                  | 📍 {project.location}, {getCountryFlag(project.country)}{" "}
                  {project.country}
                </>
              )}
            </div>
            {isLive && (
              <div
                style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}
              >
                🔄 Last update: {lastUpdateTime.toLocaleTimeString()} |
                Auto-refresh every 3 seconds
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <button
              onClick={() => setIsLive(!isLive)}
              style={{
                padding: "10px 20px",
                backgroundColor: isLive ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {isLive ? "⏸️ Stop Live" : "▶️ Start Live"}
            </button>
            <button
              onClick={onClose}
              style={{
                fontSize: "32px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                padding: "0",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes slideIn {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .new-participant {
            animation: slideIn 0.5s ease-out;
            background: linear-gradient(90deg, #d4edda 0%, white 100%);
          }
        `}</style>

        {/* Summary Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "#e3f2fd",
              borderRadius: "10px",
              textAlign: "center",
              transition: "all 0.3s",
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#1976d2" }}
            >
              {participants.length}
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
              Participants
            </div>
            {isLive && participants.length > previousCount && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#28a745",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                +{participants.length - previousCount} new!
              </div>
            )}
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff3e0",
              borderRadius: "10px",
              textAlign: "center",
              transition: "all 0.3s",
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#f57c00" }}
            >
              {totalCO2.toFixed(1)} kg
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
              Total CO₂
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "10px",
              textAlign: "center",
              transition: "all 0.3s",
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#388e3c" }}
            >
              {avgCO2.toFixed(1)} kg
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
              Avg per Participant
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f3e5f5",
              borderRadius: "10px",
              textAlign: "center",
              transition: "all 0.3s",
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#7b1fa2" }}
            >
              {avgCO2PerDay.toFixed(1)} kg
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
              Avg CO₂/Participant/Day
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>
              {isLive ? "⏳" : "📊"}
            </div>
            <h3 style={{ color: "#666", marginBottom: "10px" }}>
              {isLive ? "Waiting for participants..." : "No Participants Yet"}
            </h3>
            <p style={{ color: "#999" }}>
              {isLive
                ? "Live mode is active. New participants will appear automatically!"
                : "Share the project link to start collecting data!"}
            </p>
          </div>
        ) : (
          <>
            {/* CO2 Breakdown Chart */}
            <div
              style={{
                marginBottom: "40px",
                padding: "25px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ marginBottom: "20px", fontSize: "22px" }}>
                🏭 Total CO₂ Breakdown
              </h3>
              <div>
                {Object.entries(totalBreakdown)
                  .filter(([key, value]) => value > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, value]) => {
                    const labels = {
                      flightCO2: {
                        label: "Flight",
                        icon: "✈️",
                        color: "#007bff",
                      },
                      trainCO2: {
                        label: "Train",
                        icon: "🚆",
                        color: "#28a745",
                      },
                      busCO2: { label: "Bus", icon: "🚌", color: "#fd7e14" },
                      carCO2: { label: "Car", icon: "🚗", color: "#6f42c1" },
                      foodCO2: { label: "Food", icon: "🍖", color: "#dc3545" },
                      accCO2: {
                        label: "Accommodation",
                        icon: "🏨",
                        color: "#20c997",
                      },
                      energyCO2: {
                        label: "Energy",
                        icon: "⚡",
                        color: "#6610f2",
                      },
                      activityCO2: {
                        label: "Activities",
                        icon: "🎯",
                        color: "#17a2b8",
                      },
                    };
                    const info = labels[key];
                    const percentage = (value / totalCO2) * 100;

                    return (
                      <div key={key} style={{ marginBottom: "15px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "5px",
                          }}
                        >
                          <span
                            style={{ fontSize: "20px", marginRight: "10px" }}
                          >
                            {info.icon}
                          </span>
                          <span style={{ flex: 1, fontWeight: "bold" }}>
                            {info.label}
                          </span>
                          <span
                            style={{ fontWeight: "bold", fontSize: "16px" }}
                          >
                            {value.toFixed(1)} kg ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "25px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "12px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              backgroundColor: info.color,
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Country Breakdown */}
            <div
              style={{
                marginBottom: "40px",
                padding: "25px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ marginBottom: "20px", fontSize: "22px" }}>
                🌍 CO₂ by Country (Avg kg/Participant/Day)
              </h3>
              <div style={{ display: "grid", gap: "15px" }}>
                {sortedCountries.map(([country, stats]) => {
                  const maxAvg = Math.max(
                    ...sortedCountries.map(
                      (c) => c[1].avgCO2PerParticipantPerDay,
                    ),
                  );
                  const barWidth =
                    maxAvg > 0
                      ? (stats.avgCO2PerParticipantPerDay / maxAvg) * 100
                      : 0;

                  const getColor = (avg) => {
                    if (avg <= 6) return "#28a745";
                    if (avg <= 10) return "#ffc107";
                    if (avg <= 15) return "#fd7e14";
                    return "#dc3545";
                  };

                  return (
                    <div
                      key={country}
                      style={{
                        padding: "15px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ fontSize: "24px", marginRight: "10px" }}>
                          {getCountryFlag(country)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                            {country}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {stats.count} participant
                            {stats.count !== 1 ? "s" : ""} |{" "}
                            {stats.totalCO2.toFixed(1)} kg total
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: getColor(stats.avgCO2PerParticipantPerDay),
                          }}
                        >
                          {stats.avgCO2PerParticipantPerDay.toFixed(1)} kg/p/day
                        </div>
                      </div>
                      <div
                        style={{
                          height: "10px",
                          backgroundColor: "#e9ecef",
                          borderRadius: "5px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: "100%",
                            backgroundColor: getColor(
                              stats.avgCO2PerParticipantPerDay,
                            ),
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Participants List */}
            <div
              style={{
                padding: "25px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "22px" }}>
                  👥 Participants List
                </h3>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px" }}>
                  <button
                    onClick={() => handleSort("name")}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: sortBy === "name" ? "#28a745" : "white",
                      color: sortBy === "name" ? "white" : "#333",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: sortBy === "name" ? "bold" : "normal",
                    }}
                  >
                    Name {getSortIcon("name")}
                  </button>
                  <button
                    onClick={() => handleSort("country")}
                    style={{
                      padding: "6px 12px",
                      backgroundColor:
                        sortBy === "country" ? "#28a745" : "white",
                      color: sortBy === "country" ? "white" : "#333",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: sortBy === "country" ? "bold" : "normal",
                    }}
                  >
                    Country {getSortIcon("country")}
                  </button>
                  <button
                    onClick={() => handleSort("co2")}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: sortBy === "co2" ? "#28a745" : "white",
                      color: sortBy === "co2" ? "white" : "#333",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: sortBy === "co2" ? "bold" : "normal",
                    }}
                  >
                    CO₂ {getSortIcon("co2")}
                  </button>
                  <button
                    onClick={() => handleSort("date")}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: sortBy === "date" ? "#28a745" : "white",
                      color: sortBy === "date" ? "white" : "#333",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: sortBy === "date" ? "bold" : "normal",
                    }}
                  >
                    Date {getSortIcon("date")}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {sortedParticipants.map((participant, index) => {
                  const participantDays = Number(participant.data?.days) || 1; // Fallback to 1 to avoid division by zero
                  const co2PerDay =
                    (participant.result?.total || 0) / participantDays;
                  const isNew =
                    latestParticipant &&
                    participant.id === latestParticipant.id;

                  const getCO2Color = (total) => {
                    if (total <= 50) return "#28a745";
                    if (total <= 150) return "#ffc107";
                    if (total <= 300) return "#fd7e14";
                    return "#dc3545";
                  };

                  return (
                    <div
                      key={participant.id}
                      className={isNew ? "new-participant" : ""}
                      style={{
                        padding: "15px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: isNew ? "2px solid #28a745" : "1px solid #ddd",
                        position: "relative",
                      }}
                    >
                      {isNew && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-10px",
                            right: "10px",
                            padding: "3px 10px",
                            backgroundColor: "#28a745",
                            color: "white",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        >
                          ✨ NEW!
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            flex: 1,
                            minWidth: "200px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#999",
                            }}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <div
                              style={{ fontSize: "16px", fontWeight: "bold" }}
                            >
                              👤 {participant.data?.firstName || "Anonymous"}
                            </div>
                            <div style={{ fontSize: "13px", color: "#666" }}>
                              {participant.data?.country
                                ? `${getCountryFlag(participant.data.country)} ${participant.data.country}`
                                : "No country"}
                              {participant.data?.age &&
                                ` | ${participant.data.age} years`}
                              {participant.data?.gender &&
                                ` | ${participant.data.gender}`}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: getCO2Color(
                                  participant.result?.total || 0,
                                ),
                              }}
                            >
                              {(participant.result?.total || 0).toFixed(1)} kg
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {co2PerDay.toFixed(1)} kg/day
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#999",
                              textAlign: "right",
                              minWidth: "80px",
                            }}
                          >
                            {participant.completedAt
                              ? new Date(
                                  participant.completedAt,
                                ).toLocaleTimeString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Close Button */}
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 40px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// UPDATED PROJECT CARD WITH LIVE BUTTON
// ========================================

function ProjectCardWithLive({
  project,
  onEdit,
  onDelete,
  onShowQR,
  onShowDetails,
  onShowLive,
  participantCount,
}) {
  const [showLink, setShowLink] = useState(false);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        border: "2px solid #ddd",
        borderRadius: "10px",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      <h3
        style={{ marginBottom: "15px", fontSize: "20px", paddingRight: "60px" }}
      >
        {project.name}
      </h3>

      <div style={{ marginBottom: "15px", color: "#666" }}>
        <div style={{ marginBottom: "8px" }}>
          📅 {project.start} → {project.end}
        </div>
        {project.location && (
          <div style={{ marginBottom: "8px" }}>
            📍 {project.location}, {getCountryFlag(project.country)}{" "}
            {project.country}
          </div>
        )}
        {!project.location && (
          <div style={{ marginBottom: "8px" }}>
            🌍 {getCountryFlag(project.country)} {project.country}
          </div>
        )}
        <div style={{ marginBottom: "8px" }}>👤 {project.employeeName}</div>
        <div style={{ marginBottom: "8px" }}>
          👥 {participantCount} participant{participantCount !== 1 ? "s" : ""}
        </div>
      </div>

      {(project.activityTransport?.boat > 0 ||
        project.activityTransport?.bus > 0 ||
        project.activityTransport?.train > 0 ||
        project.activityTransport?.car > 0) && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#666",
            }}
          >
            🎯 Activities
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            {project.activityTransport.boat > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "12px",
                }}
              >
                🛥️ {project.activityTransport.boat}km
              </span>
            )}
            {project.activityTransport.bus > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "12px",
                }}
              >
                🚌 {project.activityTransport.bus}km
              </span>
            )}
            {project.activityTransport.train > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#f3e5f5",
                  borderRadius: "12px",
                }}
              >
                🚆 {project.activityTransport.train}km
              </span>
            )}
            {project.activityTransport.car > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "12px",
                }}
              >
                🚗 {project.activityTransport.car}km
              </span>
            )}
          </div>
        </div>
      )}

      {/* Link Section */}
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={() => setShowLink(!showLink)}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {showLink ? "▼" : "▶"} {showLink ? "Hide" : "Show"} Participant Link
        </button>
        {showLink && <ProjectLink projectId={project.id} />}
      </div>

      {/* Action Buttons with LIVE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        <button
          onClick={() => onShowLive(project)}
          style={{
            padding: "10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          🔴 LIVE
        </button>
        <button
          onClick={() => onShowDetails(project)}
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          📊 Details
        </button>
        <button
          onClick={() => onShowQR(project)}
          style={{
            padding: "10px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          📱 QR Code
        </button>
        <button
          onClick={() => onEdit(project)}
          style={{
            padding: "10px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          ✏️ Edit
        </button>
      </div>

      <div style={{ marginTop: "8px" }}>
        <button
          onClick={() => onDelete(project.id)}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          🗑️ Delete Project
        </button>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#999",
          marginTop: "15px",
          paddingTop: "15px",
          borderTop: "1px solid #eee",
        }}
      >
        ID: {project.id}
      </div>
    </div>
  );
}

// ========================================
// SETTINGS TAB WITH EXPORT/IMPORT
// ========================================

function SettingsTab({ organizationId, organization, onUpdate }) {
  const [name, setName] = useState(organization?.name || "");
  const [saved, setSaved] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Organization name is required");
      return;
    }
    const updated = { ...organization, name: name.trim() };
    localStorage.setItem(
      `organization_${organizationId}`,
      JSON.stringify(updated),
    );
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportAll = () => {
    try {
      const exportData = {};

      // Export all localStorage data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        exportData[key] = localStorage.getItem(key);
      }

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `greendex_backup_${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      setExportStatus("✅ Export successful!");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (error) {
      setExportStatus("❌ Export failed: " + error.message);
    }
  };

  const handleImportAll = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result);

        // Confirm before overwriting
        const confirmMsg = `This will import ${Object.keys(importData).length} items. This may overwrite existing data. Continue?`;
        if (!window.confirm(confirmMsg)) {
          setImportStatus("❌ Import cancelled");
          setTimeout(() => setImportStatus(""), 3000);
          return;
        }

        // Import all data
        Object.keys(importData).forEach((key) => {
          localStorage.setItem(key, importData[key]);
        });

        setImportStatus("✅ Import successful! Please refresh the page.");
      } catch (error) {
        setImportStatus("❌ Import failed: " + error.message);
      }
    };

    reader.readAsText(file);
    e.target.value = ""; // Reset file input
  };

  const handleExportCurrentOrg = () => {
    try {
      const exportData = {};

      // Export only current organization data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes(organizationId) || key === "currentOrganizationId") {
          exportData[key] = localStorage.getItem(key);
        }
      }

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${organization.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      setExportStatus("✅ Organization export successful!");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (error) {
      setExportStatus("❌ Export failed: " + error.message);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "30px" }}>⚙️ Organization Settings</h2>

      {/* General Settings */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            padding: "25px",
            backgroundColor: "white",
            border: "2px solid #ddd",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>General Settings</h3>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Organization Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
            }}
          >
            <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
              <strong>Organization ID:</strong> {organizationId}
            </p>
            <p style={{ margin: "0", fontSize: "14px" }}>
              <strong>Created:</strong>{" "}
              {organization?.createdAt
                ? new Date(organization.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {saved && (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#d4edda",
                color: "#155724",
                borderRadius: "5px",
                marginTop: "20px",
              }}
            >
              ✓ Settings saved successfully!
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: "20px",
              padding: "12px 30px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Update Settings
          </button>
        </div>
      </form>

      {/* Export/Import Section */}
      <div
        style={{
          padding: "25px",
          backgroundColor: "white",
          border: "2px solid #ddd",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>📦 Data Export & Import</h3>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "25px" }}>
          Share your data with colleagues or backup your information
        </p>

        {/* Export Current Organization */}
        <div
          style={{
            marginBottom: "25px",
            padding: "20px",
            backgroundColor: "#e8f5e9",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
            📤 Export This Organization
          </h4>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Export only <strong>{organization?.name}</strong> data (team,
            projects, participants)
          </p>
          <button
            onClick={handleExportCurrentOrg}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📥 Export Current Organization
          </button>
        </div>

        {/* Export All Data */}
        <div
          style={{
            marginBottom: "25px",
            padding: "20px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
            📤 Export All Data
          </h4>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Export all organizations and data from this browser
          </p>
          <button
            onClick={handleExportAll}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📥 Export All Data
          </button>
        </div>

        {/* Import Data */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fff3e0",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "10px" }}>📥 Import Data</h4>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Import data from a colleague's export file
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportAll}
            style={{ display: "none" }}
            id="import-file-input"
          />
          <label
            htmlFor="import-file-input"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#ff9800",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📤 Choose Import File
          </label>
        </div>

        {/* Status Messages */}
        {exportStatus && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: exportStatus.includes("✅")
                ? "#d4edda"
                : "#f8d7da",
              color: exportStatus.includes("✅") ? "#155724" : "#721c24",
              borderRadius: "5px",
            }}
          >
            {exportStatus}
          </div>
        )}
        {importStatus && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: importStatus.includes("✅")
                ? "#d4edda"
                : "#f8d7da",
              color: importStatus.includes("✅") ? "#155724" : "#721c24",
              borderRadius: "5px",
            }}
          >
            {importStatus}
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          <strong>💡 How to share with colleagues:</strong>
          <ol
            style={{ marginTop: "10px", marginBottom: 0, paddingLeft: "20px" }}
          >
            <li>Export your data using one of the buttons above</li>
            <li>
              Send the .json file to your colleague (email, cloud storage, etc.)
            </li>
            <li>
              Your colleague clicks "Choose Import File" and selects your file
            </li>
            <li>Your colleague refreshes the page to see your organizations</li>
          </ol>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          padding: "25px",
          backgroundColor: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "10px",
        }}
      >
        <h3 style={{ color: "#856404", marginBottom: "10px" }}>
          ⚠️ Danger Zone
        </h3>
        <p style={{ color: "#856404", marginBottom: "15px", fontSize: "14px" }}>
          Actions in this section are permanent and cannot be undone.
        </p>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Delete Organization
        </button>
      </div>
    </div>
  );
}

// ========================================
// ANIMATED COUNTER COMPONENT
// ========================================

function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const difference = value - startValue;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - (1 - progress) ** 3;
      const newValue = startValue + difference * easedProgress;

      setDisplayValue(newValue);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  );
}

// ========================================
// SLOW ANIMATED COUNTER (2-3 seconds)
// ========================================
function SlowAnimatedCounter({
  value,
  duration = 2500,
  decimals = 0,
  prefix = "",
  suffix = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const difference = value - startValue;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - (1 - progress) ** 3; // Ease-out cubic
      const newValue = startValue + difference * easedProgress;

      setDisplayValue(newValue);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  );
}

// ========================================
// SLOW ANIMATED COUNTER WITH SOUND
// ========================================
function SlowAnimatedCounterWithSound({
  value,
  duration = 2500,
  decimals = 0,
  prefix = "",
  suffix = "",
  playSound = false,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const audioContextRef = useRef(null);

  const playTickSound = () => {
    if (!playSound) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800 + (displayValue / value) * 400; // Frequenz steigt
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Leise!
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.05,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Silently fail
    }
  };

  useEffect(() => {
    const startValue = displayValue;
    const difference = value - startValue;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - (1 - progress) ** 3;
      const newValue = startValue + difference * easedProgress;

      setDisplayValue(newValue);

      // Play tick every 5 steps (weniger häufig)
      if (currentStep % 5 === 0 && playSound) {
        playTickSound();
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration, playSound]);

  return (
    <>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  );
}

// ========================================
// TIME AGO HELPER
// ========================================
function getTimeAgo(timestamp) {
  const now = new Date();
  const completed = new Date(timestamp);
  const diffMs = now - completed;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} min ${diffSec % 60} sec ago`;
  return `${diffSec} sec ago`;
}

// ========================================
// ENHANCED PARTICIPANT OVERVIEW
// ========================================
function EnhancedParticipantOverview({
  project,
  participants,
  isPresentationMode,
}) {
  const startedParticipants = JSON.parse(
    localStorage.getItem(`participants_started_${project.id}`) || "[]",
  );
  const { currentNotification, isShowing } = useNotificationQueue(participants);

  // Get last 3 finished (sorted by completion time)
  const lastFinished = [...participants]
    .sort(
      (a, b) =>
        new Date(b.completedAt || 0).getTime() -
        new Date(a.completedAt || 0).getTime(),
    )
    .slice(0, 3);

  // Nation stats
  const nationStats = {};

  startedParticipants.forEach((p) => {
    const country = p.country || "Unknown";
    if (!nationStats[country]) {
      nationStats[country] = {
        started: 0,
        completed: 0,
        startedList: [],
        completedList: [],
      };
    }
    nationStats[country].started++;
    nationStats[country].startedList.push({
      id: p.id,
      firstName: p.firstName,
      startedAt: p.startedAt,
    });
  });

  participants.forEach((p) => {
    const country = p.data?.country || "Unknown";
    if (!nationStats[country]) {
      nationStats[country] = {
        started: 0,
        completed: 0,
        startedList: [],
        completedList: [],
      };
    }
    nationStats[country].completed++;
    nationStats[country].completedList.push({
      id: p.id,
      firstName: p.data?.firstName || "Anonymous",
      co2: p.result?.total || 0,
      completedAt: p.completedAt,
    });

    const index = nationStats[country].startedList.findIndex(
      (sp) => sp.id === p.id,
    );
    if (index !== -1) {
      nationStats[country].startedList.splice(index, 1);
    }
  });

  const sortedNations = Object.entries(nationStats)
    .filter(([country, stats]) => stats.started > 0)
    .sort((a, b) => {
      if (b[1].started !== a[1].started) return b[1].started - a[1].started;
      return b[1].completed - a[1].completed;
    });

  return (
    <div
      style={{
        padding: isPresentationMode ? "20px" : "15px",
        backgroundColor: isPresentationMode ? "#2a2a2a" : "#f8f9fa",
        borderRadius: "15px",
        border: isPresentationMode ? "2px solid #444" : "none",
        height: "100%",
      }}
    >
      <h3
        style={{
          marginBottom: "15px",
          marginTop: 0,
          fontSize: isPresentationMode ? "24px" : "18px",
          color: isPresentationMode ? "#fff" : "#333",
        }}
      >
        👥 Participant Overview
      </h3>

      {/* Last 3 Finished Section with Notification Overlay */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        {/* Notification Overlay */}
        {currentNotification && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isPresentationMode ? "#1a5a1a" : "#d4edda",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              opacity: isShowing ? 1 : 0,
              transform: isShowing ? "scale(1)" : "scale(0.95)",
              transition: "all 0.5s ease-out",
              border: "3px solid #28a745",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎉</div>
            <div
              style={{
                fontSize: isPresentationMode ? "24px" : "20px",
                fontWeight: "bold",
                color: "#28a745",
                marginBottom: "8px",
              }}
            >
              {currentNotification.data?.firstName || "Someone"} finished!
            </div>
            <div
              style={{
                fontSize: isPresentationMode ? "32px" : "28px",
                fontWeight: "bold",
                color: "#2e7d32",
              }}
            >
              {(currentNotification.result?.total || 0).toFixed(1)} kg CO₂
            </div>
          </div>
        )}

        {/* Last 3 Finished List */}
        <div
          style={{
            padding: "15px",
            backgroundColor: isPresentationMode ? "#1a1a1a" : "white",
            borderRadius: "10px",
            border: isPresentationMode ? "2px solid #333" : "2px solid #ddd",
            minHeight: "140px",
            opacity: isShowing ? 0.3 : 1,
            transition: "opacity 0.5s",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#28a745",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            🎯 Last 3 Finished
          </div>
          {lastFinished.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#999",
                fontSize: "14px",
              }}
            >
              No participants finished yet
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {lastFinished.map((p, index) => (
                <div
                  key={p.id}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: isPresentationMode ? "#2a2a2a" : "#f8f9fa",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: isPresentationMode
                      ? "1px solid #444"
                      : "1px solid #e0e0e0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>✅</span>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: isPresentationMode ? "16px" : "14px",
                          }}
                        >
                          {p.data?.firstName || "Anonymous"}
                        </span>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          {getCountryFlag(p.data?.country, "16px")}
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", color: "#999" }}>
                        {getTimeAgo(p.completedAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#28a745",
                      fontSize: isPresentationMode ? "16px" : "14px",
                    }}
                  >
                    {(p.result?.total || 0).toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nations Section */}
      <div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: "#7b1fa2",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          🌍 By Nation
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedNations.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#999" }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌍</div>
              <div style={{ fontSize: "14px" }}>No participants yet</div>
            </div>
          ) : (
            sortedNations.map(([country, stats]) => (
              <div
                key={country}
                style={{
                  padding: isPresentationMode ? "12px" : "10px",
                  backgroundColor: isPresentationMode ? "#1a1a1a" : "white",
                  borderRadius: "8px",
                  border: isPresentationMode
                    ? "1px solid #333"
                    : "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom:
                      stats.startedList.length > 0 ||
                      stats.completedList.length > 0
                        ? "8px"
                        : "0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      {getCountryFlag(
                        country,
                        isPresentationMode ? "28px" : "24px",
                      )}
                    </div>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: isPresentationMode ? "16px" : "14px",
                        color: isPresentationMode ? "#fff" : "#333",
                      }}
                    >
                      {country}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: isPresentationMode ? "18px" : "16px",
                      fontWeight: "bold",
                      color: "#7b1fa2",
                    }}
                  >
                    {stats.completed}/{stats.started}
                  </div>
                </div>

                {(stats.startedList.length > 0 ||
                  stats.completedList.length > 0) && (
                  <div
                    style={{ fontSize: isPresentationMode ? "12px" : "11px" }}
                  >
                    {stats.startedList.length > 0 && (
                      <div style={{ marginBottom: "4px" }}>
                        <span style={{ color: "#ff9800", fontWeight: "bold" }}>
                          ⏳{" "}
                        </span>
                        {stats.startedList.map((p, i) => (
                          <span key={p.id}>
                            <span
                              style={{
                                color: isPresentationMode
                                  ? "#ff9800"
                                  : "#e65100",
                              }}
                            >
                              {p.firstName}
                            </span>
                            {i < stats.startedList.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    )}

                    {stats.completedList.length > 0 && (
                      <div>
                        <span style={{ color: "#28a745", fontWeight: "bold" }}>
                          ✅{" "}
                        </span>
                        {stats.completedList.map((p, i) => (
                          <span key={p.id}>
                            <span
                              style={{
                                color: isPresentationMode
                                  ? "#4caf50"
                                  : "#2e7d32",
                              }}
                            >
                              {p.firstName}
                            </span>
                            <span
                              style={{
                                color: isPresentationMode ? "#666" : "#999",
                                fontSize: "10px",
                                marginLeft: "2px",
                              }}
                            >
                              ({p.co2.toFixed(0)}kg)
                            </span>
                            {i < stats.completedList.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// ULTIMATE LIVE PRESENTATION VIEW
// ========================================

function UltimateLiveView({ project, onClose, isLiveMode = true }) {
  const [participants, setParticipants] = useState([]);
  const [isLive, setIsLive] = useState(isLiveMode);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [previousCount, setPreviousCount] = useState(0);
  const [latestParticipant, setLatestParticipant] = useState(null);
  const [tickerNotification, setTickerNotification] = useState(null);
  const [notificationKey, setNotificationKey] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Benchmarks (from your existing logic)
  const benchmarks = { q1: 6, q2: 10, q3: 15 };

  const loadParticipants = () => {
    if (project) {
      const data = localStorage.getItem(`participants_${project.id}`);
      if (data) {
        const newParticipants = JSON.parse(data);

        // Check for new participants
        if (newParticipants.length > participants.length) {
          const sortedByDate = [...newParticipants].sort(
            (a, b) =>
              new Date(b.completedAt || 0).getTime() -
              new Date(a.completedAt || 0).getTime(),
          );
          const newest = sortedByDate[0];

          if (
            newest &&
            (!latestParticipant || newest.id !== latestParticipant.id)
          ) {
            setLatestParticipant(newest);
            setTickerNotification(newest);
            setNotificationKey((prev) => prev + 1);
          }
        }

        setPreviousCount(participants.length);
        setParticipants(newParticipants);
        setLastUpdateTime(new Date());
      }
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [project]);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        loadParticipants();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLive, project, participants, latestParticipant]);

  if (!project) return null;

  // Calculate statistics
  const totalCO2 = participants.reduce(
    (sum, p) => sum + (p.result?.total || 0),
    0,
  );
  const avgCO2 = participants.length > 0 ? totalCO2 / participants.length : 0;

  // Get started participants count
  const startedParticipants = JSON.parse(
    localStorage.getItem(`participants_started_${project.id}`) || "[]",
  );
  const startedCount = startedParticipants.length;
  const completedCount = participants.length;

  // DEBUG: Füge diese Zeilen hinzu
  console.log("📊 LIVE VIEW DEBUG:", {
    projectId: project.id,
    startedCount,
    completedCount,
    startedParticipants,
    completedParticipants: participants,
    storageKey: `participants_started_${project.id}`,
  });

  // NEW: Use actual participant days instead of project duration
  const totalParticipantDays = participants.reduce((sum, p) => {
    return sum + (Number(p.data?.days) || 0);
  }, 0);
  const avgCO2PerDay =
    totalParticipantDays > 0 ? totalCO2 / totalParticipantDays : 0;

  const totalTreesYear = totalCO2 / 30;
  const totalTreesPlant = totalCO2 / 3000;

  // CO2 breakdown
  const totalBreakdown = {
    flightCO2: 0,
    trainCO2: 0,
    busCO2: 0,
    carCO2: 0,
    foodCO2: 0,
    accCO2: 0,
    energyCO2: 0,
    activityCO2: 0,
  };

  participants.forEach((p) => {
    if (p.result) {
      Object.keys(totalBreakdown).forEach((key) => {
        totalBreakdown[key] += p.result[key] || 0;
      });
    }
  });

  const topBreakdown = Object.entries(totalBreakdown)
    .filter(([key, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Ranking (Best = lowest CO2)
  const rankedParticipants = [...participants]
    .filter((p) => p.result?.total > 0)
    .sort((a, b) => (a.result?.total || 0) - (b.result?.total || 0));

  const getCppdColor = (cppd) => {
    if (cppd <= benchmarks.q1) return "#28a745";
    if (cppd <= benchmarks.q2) return "#ffc107";
    if (cppd <= benchmarks.q3) return "#fd7e14";
    return "#dc3545";
  };

  const cppdColor = getCppdColor(avgCO2PerDay);

  const categoryLabels = {
    flightCO2: { label: "Flight", icon: "✈️", color: "#007bff" },
    trainCO2: { label: "Train", icon: "🚆", color: "#28a745" },
    busCO2: { label: "Bus", icon: "🚌", color: "#fd7e14" },
    carCO2: { label: "Car", icon: "🚗", color: "#6f42c1" },
    foodCO2: { label: "Food", icon: "🍖", color: "#dc3545" },
    accCO2: { label: "Accommodation", icon: "🏨", color: "#20c997" },
    energyCO2: { label: "Energy", icon: "⚡", color: "#6610f2" },
    activityCO2: { label: "Activities", icon: "🎯", color: "#17a2b8" },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isPresentationMode ? "#1a1a1a" : "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: isPresentationMode ? "0" : "20px",
        overflow: "auto",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .highlight-new {
          animation: pulse 2s ease-in-out 3;
        }
      `}</style>

      <div
        style={{
          backgroundColor: isPresentationMode ? "#1a1a1a" : "white",
          borderRadius: isPresentationMode ? "0" : "15px",
          width: isPresentationMode ? "100%" : "95%",
          height: isPresentationMode ? "100vh" : "auto",
          maxHeight: isPresentationMode ? "100vh" : "95vh",
          overflow: "auto",
          padding: isPresentationMode ? "40px" : "30px",
          color: isPresentationMode ? "white" : "inherit",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            borderBottom: isPresentationMode
              ? "3px solid #333"
              : "2px solid #e9ecef",
            paddingBottom: "20px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "10px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: isPresentationMode ? "48px" : "36px",
                }}
              >
                📊 {project.name}
              </h1>
              {isLive && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 20px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "25px",
                    animation: "pulse 2s infinite",
                    fontSize: isPresentationMode ? "20px" : "16px",
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      animation: "blink 1s infinite",
                    }}
                  ></span>
                  <span style={{ fontWeight: "bold" }}>LIVE</span>
                </div>
              )}
            </div>
            {!isPresentationMode && (
              <div style={{ fontSize: "14px", color: "#666" }}>
                📅 {project.start} - {project.end} | 🔄 Updates every 3 seconds
              </div>
            )}
          </div>

          {!isPresentationMode && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => setIsPresentationMode(true)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#6f42c1",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                🖥️ Presentation Mode
              </button>
              <button
                onClick={() => setIsLive(!isLive)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: isLive ? "#dc3545" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {isLive ? "⏸️ Pause" : "▶️ Resume"}
              </button>
              <button
                onClick={onClose}
                style={{
                  fontSize: "32px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {isPresentationMode && (
            <button
              onClick={() => setIsPresentationMode(false)}
              style={{
                padding: "12px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              ← Exit Presentation
            </button>
          )}
        </div>

        {/* Main Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isPresentationMode
              ? "repeat(5, 1fr)"
              : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              padding: isPresentationMode ? "40px 30px" : "25px",
              backgroundColor: isPresentationMode ? "#2a2a2a" : "#fff3e0",
              borderRadius: "15px",
              textAlign: "center",
              border: isPresentationMode ? "2px solid #f57c00" : "none",
            }}
          >
            <div
              style={{
                fontSize: isPresentationMode ? "64px" : "48px",
                fontWeight: "bold",
                color: "#f57c00",
              }}
            >
              <SlowAnimatedCounterWithSound
                value={totalCO2}
                decimals={1}
                suffix=" kg"
                duration={2500}
                playSound={true}
              />
            </div>
            <div
              style={{
                fontSize: isPresentationMode ? "18px" : "14px",
                color: isPresentationMode ? "#ccc" : "#666",
                marginTop: "10px",
              }}
            >
              🏭 Total CO₂
            </div>
          </div>

          <div
            style={{
              padding: isPresentationMode ? "40px 30px" : "25px",
              backgroundColor: isPresentationMode ? "#2a2a2a" : "#e8f5e9",
              borderRadius: "15px",
              textAlign: "center",
              border: isPresentationMode ? "2px solid #388e3c" : "none",
            }}
          >
            <div
              style={{
                fontSize: isPresentationMode ? "64px" : "48px",
                fontWeight: "bold",
                color: "#388e3c",
              }}
            >
              <AnimatedCounter
                value={totalTreesYear}
                decimals={0}
                prefix="🌳 "
                duration={2500}
              />
            </div>
            <div
              style={{
                fontSize: isPresentationMode ? "18px" : "14px",
                color: isPresentationMode ? "#ccc" : "#666",
                marginTop: "10px",
              }}
            >
              Trees (1 Year)
            </div>
          </div>

          <div
            style={{
              padding: isPresentationMode ? "40px 30px" : "25px",
              backgroundColor: isPresentationMode ? "#2a2a2a" : "#e3f2fd",
              borderRadius: "15px",
              textAlign: "center",
              border: isPresentationMode ? "2px solid #1976d2" : "none",
            }}
          >
            <div
              style={{
                fontSize: isPresentationMode ? "64px" : "48px",
                fontWeight: "bold",
                color: "#1976d2",
              }}
            >
              <AnimatedCounter
                value={totalTreesPlant}
                decimals={0}
                prefix="🌱 "
                duration={2500}
              />
            </div>
            <div
              style={{
                fontSize: isPresentationMode ? "18px" : "14px",
                color: isPresentationMode ? "#ccc" : "#666",
                marginTop: "10px",
              }}
            >
              Trees to Plant
            </div>
          </div>

          <div
            style={{
              padding: isPresentationMode ? "40px 30px" : "25px",
              backgroundColor: isPresentationMode ? "#2a2a2a" : "#f3e5f5",
              borderRadius: "15px",
              textAlign: "center",
              border: isPresentationMode ? "2px solid #7b1fa2" : "none",
            }}
          >
            <div
              style={{
                fontSize: isPresentationMode ? "64px" : "48px",
                fontWeight: "bold",
                color: "#7b1fa2",
              }}
            >
              <AnimatedCounter value={completedCount} decimals={0} />
              <span
                style={{
                  fontSize: isPresentationMode ? "48px" : "36px",
                  color: isPresentationMode ? "#666" : "#999",
                  margin: "0 8px",
                }}
              >
                /
              </span>
              <AnimatedCounter value={startedCount} decimals={0} />
            </div>
            <div
              style={{
                fontSize: isPresentationMode ? "18px" : "14px",
                color: isPresentationMode ? "#ccc" : "#666",
                marginTop: "10px",
              }}
            >
              👥 Participants (Completed / Started)
            </div>
            {completedCount > previousCount && (
              <div
                style={{
                  fontSize: isPresentationMode ? "16px" : "13px",
                  color: "#28a745",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                +{completedCount - previousCount} NEW!
              </div>
            )}
          </div>

          <div
            style={{
              padding: isPresentationMode ? "40px 30px" : "25px",
              backgroundColor: isPresentationMode
                ? "#2a2a2a"
                : cppdColor === "#28a745"
                  ? "#d4edda"
                  : cppdColor === "#ffc107"
                    ? "#fff3cd"
                    : cppdColor === "#fd7e14"
                      ? "#ffe5cc"
                      : "#f8d7da",
              borderRadius: "15px",
              textAlign: "center",
              border: isPresentationMode ? `3px solid ${cppdColor}` : "none",
            }}
          >
            <div
              style={{
                fontSize: isPresentationMode ? "64px" : "48px",
                fontWeight: "bold",
                color: cppdColor,
              }}
            >
              <AnimatedCounter
                value={avgCO2PerDay}
                decimals={1}
                duration={2500}
              />
            </div>
            <div
              style={{
                fontSize: isPresentationMode ? "18px" : "14px",
                color: isPresentationMode ? "#ccc" : "#666",
                marginTop: "10px",
              }}
            >
              📉 kg/Participant/Day
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              backgroundColor: isPresentationMode ? "#2a2a2a" : "#f8f9fa",
              borderRadius: "15px",
            }}
          >
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>⏳</div>
            <h2
              style={{
                color: isPresentationMode ? "#ccc" : "#666",
                marginBottom: "15px",
              }}
            >
              Waiting for participants...
            </h2>
            <p
              style={{
                color: isPresentationMode ? "#999" : "#999",
                fontSize: "18px",
              }}
            >
              Live mode is active. New participants will appear automatically!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPresentationMode ? "1fr 1fr 1fr" : "1fr",
              gap: "30px",
            }}
          >
            {/* CO2 Breakdown */}
            <div
              style={{
                padding: "25px",
                backgroundColor: isPresentationMode ? "#2a2a2a" : "#f8f9fa",
                borderRadius: "15px",
                border: isPresentationMode ? "2px solid #444" : "none",
              }}
            >
              <h3
                style={{
                  marginBottom: "20px",
                  fontSize: isPresentationMode ? "28px" : "22px",
                }}
              >
                🏭 CO₂ Breakdown
              </h3>
              <div style={{ display: "grid", gap: "15px" }}>
                {topBreakdown.map(([key, value]) => {
                  const info = categoryLabels[key];
                  const percentage = (value / totalCO2) * 100;
                  return (
                    <div key={key}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontSize: "24px", marginRight: "12px" }}>
                          {info.icon}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontWeight: "bold",
                            fontSize: isPresentationMode ? "18px" : "16px",
                          }}
                        >
                          {info.label}
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: isPresentationMode ? "18px" : "16px",
                          }}
                        >
                          {value.toFixed(1)} kg
                        </span>
                      </div>
                      <div
                        style={{
                          height: "20px",
                          backgroundColor: isPresentationMode
                            ? "#1a1a1a"
                            : "#e9ecef",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            backgroundColor: info.color,
                            transition: "width 1s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⭐ NEU: Nation Overview */}
            <EnhancedParticipantOverview
              project={project}
              participants={participants}
              isPresentationMode={isPresentationMode}
            />

            {/* Podium Ranking */}
            <div
              style={{
                padding: "25px",
                backgroundColor: isPresentationMode ? "#2a2a2a" : "#f8f9fa",
                borderRadius: "15px",
                border: isPresentationMode ? "2px solid #444" : "none",
              }}
            >
              <h3
                style={{
                  marginBottom: "20px",
                  fontSize: isPresentationMode ? "28px" : "22px",
                }}
              >
                🏆 Participant Ranking
              </h3>

              {/* Podium - Top 3 */}
              {rankedParticipants.length >= 3 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "30px",
                  }}
                >
                  {/* 2nd Place */}
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: "48px" }}>🥈</div>
                    <div
                      style={{
                        padding: "20px 10px",
                        backgroundColor: "#c0c0c0",
                        borderRadius: "10px 10px 0 0",
                        height: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#fff",
                        }}
                      >
                        {rankedParticipants[1]?.data?.firstName || "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#fff",
                          marginTop: "5px",
                        }}
                      >
                        {(rankedParticipants[1]?.result?.total || 0).toFixed(1)}{" "}
                        kg
                      </div>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: "56px" }}>🥇</div>
                    <div
                      style={{
                        padding: "25px 10px",
                        backgroundColor: "#ffd700",
                        borderRadius: "10px 10px 0 0",
                        height: "160px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(255, 215, 0, 0.5)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          color: "#333",
                        }}
                      >
                        {rankedParticipants[0]?.data?.firstName || "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#333",
                          marginTop: "5px",
                        }}
                      >
                        {(rankedParticipants[0]?.result?.total || 0).toFixed(1)}{" "}
                        kg
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: "48px" }}>🥉</div>
                    <div
                      style={{
                        padding: "15px 10px",
                        backgroundColor: "#cd7f32",
                        borderRadius: "10px 10px 0 0",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#fff",
                        }}
                      >
                        {rankedParticipants[2]?.data?.firstName || "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#fff",
                          marginTop: "5px",
                        }}
                      >
                        {(rankedParticipants[2]?.result?.total || 0).toFixed(1)}{" "}
                        kg
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of participants */}
              {rankedParticipants.length > 3 && (
                <div
                  style={{
                    maxHeight: isPresentationMode ? "300px" : "200px",
                    overflow: "auto",
                  }}
                >
                  {rankedParticipants.slice(3).map((p, index) => {
                    const isLatest =
                      latestParticipant && p.id === latestParticipant.id;
                    return (
                      <div
                        key={p.id}
                        className={isLatest ? "highlight-new" : ""}
                        style={{
                          padding: "12px",
                          backgroundColor: isPresentationMode
                            ? "#1a1a1a"
                            : "white",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          border: isLatest
                            ? "2px solid #28a745"
                            : isPresentationMode
                              ? "1px solid #333"
                              : "1px solid #ddd",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span style={{ fontWeight: "bold", color: "#999" }}>
                            #{index + 4}
                          </span>
                          <span style={{ fontWeight: "bold" }}>
                            {p.data?.firstName || "Anonymous"}
                          </span>
                        </div>
                        <span style={{ fontWeight: "bold", color: "#666" }}>
                          {(p.result?.total || 0).toFixed(1)} kg
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// PROJECTS TAB WITH LINKS & LIVE
// ========================================

function ProjectsTabWithLinks({ organizationId, currentUserId }) {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [qrModalProject, setQrModalProject] = useState(null);
  const [detailsProject, setDetailsProject] = useState(null);
  const [liveProject, setLiveProject] = useState(null);

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, [organizationId]);

  const loadProjects = () => {
    const data = localStorage.getItem(`projects_${organizationId}`);
    if (data) setProjects(JSON.parse(data));
  };

  const loadEmployees = () => {
    const data = localStorage.getItem(`employees_${organizationId}`);
    if (data) setEmployees(JSON.parse(data));
  };

  const handleSaveProject = (projectData) => {
    const existingProjects = JSON.parse(
      localStorage.getItem(`projects_${organizationId}`) || "[]",
    );

    if (editingProject) {
      const updatedProjects = existingProjects.map((p) =>
        p.id === projectData.id ? projectData : p,
      );
      localStorage.setItem(
        `projects_${organizationId}`,
        JSON.stringify(updatedProjects),
      );
      setProjects(updatedProjects);
    } else {
      const newProjects = [...existingProjects, projectData];
      localStorage.setItem(
        `projects_${organizationId}`,
        JSON.stringify(newProjects),
      );
      setProjects(newProjects);
    }

    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (projectId) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(
      `projects_${organizationId}`,
      JSON.stringify(updatedProjects),
    );
    localStorage.removeItem(`participants_${projectId}`);
    setProjects(updatedProjects);
    setShowDeleteConfirm(null);
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const getParticipantCount = (projectId) => {
    const participants = JSON.parse(
      localStorage.getItem(`participants_${projectId}`) || "[]",
    );
    return participants.length;
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ margin: 0 }}>📋 Projects ({projects.length})</h2>
        <button
          onClick={handleCreateNew}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          + Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>📋</div>
          <h3 style={{ color: "#666", marginBottom: "10px" }}>
            No projects yet
          </h3>
          <p style={{ color: "#999", marginBottom: "20px" }}>
            Create your first project to get started!
          </p>
          <button
            onClick={handleCreateNew}
            style={{
              padding: "12px 30px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            + Create First Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((p) => {
            const participantCount = getParticipantCount(p.id);

            if (showDeleteConfirm === p.id) {
              return (
                <div
                  key={p.id}
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    border: "2px solid #dc3545",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                  }}
                >
                  <div style={{ fontSize: "50px", marginBottom: "15px" }}>
                    ⚠️
                  </div>
                  <p
                    style={{
                      textAlign: "center",
                      marginBottom: "15px",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    Delete "{p.name}"?
                  </p>
                  <p
                    style={{
                      textAlign: "center",
                      marginBottom: "20px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    This will delete the project and all {participantCount}{" "}
                    participant{participantCount !== 1 ? "s" : ""} data!
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <ProjectCardWithLive
                key={p.id}
                project={p}
                onEdit={handleEditProject}
                onDelete={setShowDeleteConfirm}
                onShowQR={setQrModalProject}
                onShowDetails={setDetailsProject}
                onShowLive={setLiveProject}
                participantCount={participantCount}
              />
            );
          })}
        </div>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        organizationId={organizationId}
        currentUserId={currentUserId}
        employees={employees}
      />

      <QRCodeModal
        isOpen={!!qrModalProject}
        onClose={() => setQrModalProject(null)}
        project={qrModalProject}
      />

      <UltimateLiveView
        project={detailsProject}
        onClose={() => setDetailsProject(null)}
        isLiveMode={false}
      />

      <UltimateLiveView
        project={liveProject}
        onClose={() => setLiveProject(null)}
        isLiveMode={true}
      />
    </div>
  );
}

// ========================================
// APP ORGANIZER - Main with Tabs & Org Switcher
// ========================================

function AppOrganizer() {
  const [organizationId, setOrganizationId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [needsUserSelection, setNeedsUserSelection] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [showNewOrgSetup, setShowNewOrgSetup] = useState(false);

  useEffect(() => {
    const orgId = localStorage.getItem("currentOrganizationId");

    if (!orgId) {
      // No org selected - show selector
      setShowOrgSelector(true);
      return;
    }

    // Check if org still exists
    const orgData = localStorage.getItem(`organization_${orgId}`);
    if (!orgData) {
      // Org was deleted - show selector
      setShowOrgSelector(true);
      return;
    }

    setOrganizationId(orgId);
    setOrganization(JSON.parse(orgData));

    const userId = sessionStorage.getItem("currentEmployeeId");
    if (!userId) {
      setNeedsUserSelection(true);
      return;
    }
    setCurrentUserId(userId);
  }, []);

  const handleOrgSelect = (orgId) => {
    localStorage.setItem("currentOrganizationId", orgId);
    sessionStorage.removeItem("currentEmployeeId"); // Clear user selection
    setOrganizationId(orgId);

    const orgData = localStorage.getItem(`organization_${orgId}`);
    if (orgData) setOrganization(JSON.parse(orgData));

    setShowOrgSelector(false);
    setNeedsUserSelection(true);
  };

  const handleCreateNew = () => {
    setShowOrgSelector(false);
    setShowNewOrgSetup(true);
  };

  const handleOrgSetupComplete = ({ organization, primaryAdmin }) => {
    setOrganization(organization);
    setOrganizationId(organization.id);
    setCurrentUserId(primaryAdmin.id);
    setShowNewOrgSetup(false);
  };

  const handleSwitchOrg = () => {
    setShowOrgSelector(true);
  };

  if (showOrgSelector) {
    return (
      <OrganizationSelector
        onSelect={handleOrgSelect}
        onCreateNew={handleCreateNew}
      />
    );
  }

  if (showNewOrgSetup) {
    return <OrganizationSetup onComplete={handleOrgSetupComplete} />;
  }

  if (needsUserSelection) {
    return (
      <UserSelection
        organizationId={organizationId}
        onUserSelected={(emp) => {
          setCurrentUserId(emp.id);
          setNeedsUserSelection(false);
        }}
      />
    );
  }

  const tabStyle = (isActive) => ({
    padding: "12px 24px",
    backgroundColor: isActive ? "#28a745" : "transparent",
    color: isActive ? "white" : "#666",
    border: "none",
    borderBottom: isActive ? "3px solid #28a745" : "3px solid transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.2s",
  });

  return (
    <div>
      {/* Header with Org Info & Switch Button */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          borderBottom: "2px solid #ddd",
          padding: "20px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 5px 0", fontSize: "28px" }}>
              🌱 Greendex Organizer
            </h1>
            {organization && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                  {organization.name}
                </p>
              </div>
            )}
          </div>

          {/* Switch Organization Button */}
          <button
            onClick={handleSwitchOrg}
            style={{
              padding: "10px 20px",
              backgroundColor: "white",
              color: "#28a745",
              border: "2px solid #28a745",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#28a745";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#28a745";
            }}
          >
            🔄 Switch Organization
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "2px solid #ddd",
          backgroundColor: "white",
        }}
      >
        <button
          onClick={() => setActiveTab("dashboard")}
          style={tabStyle(activeTab === "dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("team")}
          style={tabStyle(activeTab === "team")}
        >
          👥 Team
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          style={tabStyle(activeTab === "projects")}
        >
          📋 Projects
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          style={tabStyle(activeTab === "settings")}
        >
          ⚙️ Settings
        </button>
      </div>

      <div style={{ minHeight: "600px", backgroundColor: "#f8f9fa" }}>
        {activeTab === "dashboard" && (
          <OrganizationDashboard organizationId={organizationId} />
        )}
        {activeTab === "team" && (
          <TeamManagementComplete
            organizationId={organizationId}
            currentUserId={currentUserId}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsTabWithLinks
            organizationId={organizationId}
            currentUserId={currentUserId}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            organizationId={organizationId}
            organization={organization}
            onUpdate={(updated) => setOrganization(updated)}
          />
        )}
      </div>
    </div>
  );
}

// ========================================
// LIVE COUNTER COMPONENT
// ========================================

function LiveCounter({
  co2Value,
  treesValue,
  previousCO2 = 0,
  showAnimation = false,
}) {
  const [displayCO2, setDisplayCO2] = useState(co2Value);
  const [displayTrees, setDisplayTrees] = useState(treesValue);

  useEffect(() => {
    if (showAnimation && Math.abs(co2Value - previousCO2) > 0.1) {
      const duration = 2000;
      const steps = 100;
      const startCO2 = displayCO2;
      const startTrees = displayTrees;
      const targetCO2 = co2Value;
      const targetTrees = treesValue;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easedProgress = 1 - (1 - progress) ** 3;

        const newCO2 = startCO2 + (targetCO2 - startCO2) * easedProgress;
        const newTrees =
          startTrees + (targetTrees - startTrees) * easedProgress;

        setDisplayCO2(newCO2);
        setDisplayTrees(newTrees);

        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayCO2(targetCO2);
          setDisplayTrees(targetTrees);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayCO2(co2Value);
      setDisplayTrees(treesValue);
    }
  }, [co2Value, treesValue, previousCO2, showAnimation]);

  const getCO2Color = () => {
    if (displayCO2 <= 50) return "#28a745";
    if (displayCO2 <= 150) return "#ffc107";
    if (displayCO2 <= 300) return "#fd7e14";
    return "#dc3545";
  };

  const getTreesColor = () => {
    if (displayTrees <= 2) return "#28a745";
    if (displayTrees <= 5) return "#ffc107";
    if (displayTrees <= 10) return "#fd7e14";
    return "#dc3545";
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        marginBottom: "30px",
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: "300px",
          padding: "20px",
          border: `3px solid ${getCO2Color()}`,
          borderRadius: "10px",
          textAlign: "center",
          backgroundColor: "white",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🏭</div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: getCO2Color(),
            marginBottom: "5px",
          }}
        >
          {displayCO2.toFixed(1)} kg
        </div>
        <div style={{ color: "#666", fontSize: "16px" }}>CO₂ Footprint</div>
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: "300px",
          padding: "20px",
          border: `3px solid ${getTreesColor()}`,
          borderRadius: "10px",
          textAlign: "center",
          backgroundColor: "white",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🌳</div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: getTreesColor(),
            marginBottom: "5px",
          }}
        >
          {Math.ceil(displayTrees)}
        </div>
        <div style={{ color: "#666", fontSize: "16px" }}>Trees (1 Year)</div>
      </div>
    </div>
  );
}

// ========================================
// INTRO IMPACT SCREEN WITH NAME + COUNTRY
// ========================================

function IntroImpactScreen({ project, onComplete }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [country, setCountry] = useState("");
  const [showCounters, setShowCounters] = useState(false);
  const [showWelcomeText, setShowWelcomeText] = useState(false);
  const [showActivityText, setShowActivityText] = useState(false);
  const [animateCounters, setAnimateCounters] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const CO2_PER_KM = { flight: 0.386, train: 0.074, bus: 0.068, car: 0.36 };
  const TREE_CALCULATIONS = { co2PerTreePerYear: 30, treeLifespan: 100 };

  const activityCO2 = React.useMemo(() => {
    if (!project.activityTransport) return 0;
    let total = 0;
    total += (project.activityTransport.boat || 0) * 0.5;
    total += (project.activityTransport.bus || 0) * CO2_PER_KM.bus;
    total += (project.activityTransport.train || 0) * CO2_PER_KM.train;
    total += (project.activityTransport.car || 0) * CO2_PER_KM.car;
    return total;
  }, [project]);

  const activityTrees = activityCO2 / TREE_CALCULATIONS.co2PerTreePerYear;

  const [displayCO2, setDisplayCO2] = useState(0);
  const [displayTrees, setDisplayTrees] = useState(0);

  const countries = [
    "Austria",
    "Belgium",
    "Bulgaria",
    "Croatia",
    "Czech Republic",
    "Denmark",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Ireland",
    "Italy",
    "Netherlands",
    "Norway",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland",
    "United Kingdom",
  ];

  useEffect(() => {
    if (currentPhase === 2) {
      setTimeout(() => setShowCounters(true), 500);
      setTimeout(() => setShowWelcomeText(true), 1500);
      setTimeout(() => {
        setShowWelcomeText(false);
        setCurrentPhase(3);
      }, 6000);
    } else if (currentPhase === 3) {
      setTimeout(() => setShowActivityText(true), 500);
      setTimeout(() => {
        setShowActivityText(false);
        setCurrentPhase(4);
      }, 6000);
    } else if (currentPhase === 4) {
      setAnimateCounters(true);
      animateTachoCounters();
      setTimeout(() => setCurrentPhase(5), 3000);
    } else if (currentPhase === 5) {
      setTimeout(() => setShowFinalText(true), 500);
      setTimeout(() => setShowButton(true), 5000);
    }
  }, [currentPhase]);

  const animateTachoCounters = () => {
    const duration = 2000;
    const steps = 100;
    const targetCO2 = activityCO2;
    const targetTrees = activityTrees;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - (1 - progress) ** 3;

      const newCO2 = targetCO2 * easedProgress;
      const newTrees = targetTrees * easedProgress;

      setDisplayCO2(newCO2);
      setDisplayTrees(newTrees);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayCO2(targetCO2);
        setDisplayTrees(targetTrees);
      }
    }, duration / steps);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (firstName.trim() && country) {
      setCurrentPhase(2);
    }
  };

  const getCO2Color = () => {
    if (displayCO2 <= 50) return "#28a745";
    if (displayCO2 <= 150) return "#ffc107";
    if (displayCO2 <= 300) return "#fd7e14";
    return "#dc3545";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "40px" }}>
          Welcome to Greendex
        </h1>

        {currentPhase === 1 && (
          <div>
            <p style={{ fontSize: "24px", marginBottom: "30px" }}>
              Before we start, please tell us:
            </p>
            <form onSubmit={handleNameSubmit}>
              <div style={{ marginBottom: "25px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    textAlign: "left",
                  }}
                >
                  Your first name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "18px",
                    borderRadius: "5px",
                    border: "2px solid #ddd",
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    textAlign: "left",
                  }}
                >
                  In which country do you live? *
                </label>

                {/* DROPDOWN - NUR TEXT */}
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "18px",
                    borderRadius: "5px",
                    border: "2px solid #ddd",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Select a country --</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c} {/* ⭐ NUR DER NAME, KEINE FLAGGE */}
                    </option>
                  ))}
                </select>

                {/* Flaggen-Anzeige nach Auswahl */}
                {country && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "#e8f5e9",
                      borderRadius: "8px",
                      border: "2px solid #28a745",
                    }}
                  >
                    {getCountryFlag(country, "24px")}
                    <span
                      style={{
                        marginLeft: "10px",
                        fontWeight: "bold",
                        color: "#2e7d32",
                      }}
                    >
                      Selected: {country}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!firstName.trim() || !country}
                style={{
                  padding: "15px 40px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  backgroundColor:
                    firstName.trim() && country ? "#28a745" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor:
                    firstName.trim() && country ? "pointer" : "not-allowed",
                }}
              >
                Continue →
              </button>
            </form>
          </div>
        )}

        {currentPhase >= 2 && (
          <>
            <div
              style={{
                display: "flex",
                gap: "30px",
                justifyContent: "center",
                marginBottom: "40px",
                opacity: showCounters ? 1 : 0,
                transition: "opacity 1s",
              }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: "300px",
                  padding: "30px",
                  backgroundColor: "white",
                  borderRadius: "15px",
                  border: "3px solid " + getCO2Color(),
                }}
              >
                <div style={{ fontSize: "50px", marginBottom: "15px" }}>🏭</div>
                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "bold",
                    color: getCO2Color(),
                    marginBottom: "10px",
                  }}
                >
                  {displayCO2.toFixed(1)} kg
                </div>
                <div style={{ fontSize: "16px", color: "#666" }}>
                  CO₂ Footprint
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  maxWidth: "300px",
                  padding: "30px",
                  backgroundColor: "white",
                  borderRadius: "15px",
                  border: "3px solid #28a745",
                }}
              >
                <div style={{ fontSize: "50px", marginBottom: "15px" }}>🌳</div>
                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "bold",
                    color: "#28a745",
                    marginBottom: "10px",
                  }}
                >
                  {Math.ceil(displayTrees)}
                </div>
                <div style={{ fontSize: "16px", color: "#666" }}>
                  Trees (1 Year)
                </div>
              </div>
            </div>

            {showWelcomeText && (
              <div
                style={{
                  padding: "30px",
                  backgroundColor: "white",
                  borderRadius: "15px",
                  marginBottom: "30px",
                  opacity: showWelcomeText ? 1 : 0,
                  transition: "opacity 1s",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>Hello {firstName} from</span>
                  {getCountryFlag(country, "32px")}
                  <span>{country}! 👋</span>
                </div>
                <p style={{ fontSize: "20px", color: "#666" }}>
                  <TypewriterText
                    text={`In the next few minutes, we will calculate your personal CO₂ footprint for the project "${project.name}".`}
                    speed={30}
                  />
                </p>
              </div>
            )}

            {showActivityText && (
              <div
                style={{
                  padding: "30px",
                  backgroundColor: "white",
                  borderRadius: "15px",
                  marginBottom: "30px",
                  opacity: showActivityText ? 1 : 0,
                  transition: "opacity 1s",
                }}
              >
                <p style={{ fontSize: "20px", color: "#666" }}>
                  <TypewriterText
                    text={
                      activityCO2 > 0
                        ? "During project activities like excursions, CO₂ is already being emitted. Your organizer has calculated the amount of CO₂ generated during these activities."
                        : "The organizer has not specified any project activities. Your footprint will only include your personal travel and accommodation."
                    }
                    speed={25}
                  />
                </p>
              </div>
            )}

            {showFinalText && (
              <div
                style={{
                  padding: "30px",
                  backgroundColor: "white",
                  borderRadius: "15px",
                  marginBottom: "30px",
                  opacity: showFinalText ? 1 : 0,
                  transition: "opacity 1s",
                }}
              >
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#28a745",
                  }}
                >
                  <TypewriterText
                    text={`We wish you lots of fun and some "Aha!" moments on your journey with Greendex! 🌱`}
                    speed={30}
                  />
                </p>
              </div>
            )}

            {showButton && (
              <div
                style={{
                  opacity: showButton ? 1 : 0,
                  transition: "opacity 1s",
                }}
              >
                <button
                  onClick={() => onComplete(firstName, country)}
                  style={{
                    padding: "20px 50px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                  }}
                >
                  Start Greendex →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ========================================
// IMPACT SCREEN COMPONENT
// ========================================

function ImpactScreen({
  previousCO2,
  newCO2,
  stepKey,
  stepValue,
  onContinue,
  isVisible,
  data,
}) {
  const [showCounters, setShowCounters] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [displayCO2, setDisplayCO2] = useState(previousCO2);
  const [displayTrees, setDisplayTrees] = useState(
    previousCO2 / TREE_CALCULATIONS.co2PerTreePerYear,
  );

  const difference = newCO2 - previousCO2;
  const isIncrease = difference > 0;
  const impact = Math.abs(difference);

  useEffect(() => {
    if (isVisible) {
      setDisplayCO2(previousCO2);
      setDisplayTrees(previousCO2 / TREE_CALCULATIONS.co2PerTreePerYear);

      setTimeout(() => setShowCounters(true), 500);
      setTimeout(() => {
        animateCounters();
      }, 1000);

      setTimeout(() => setShowMessage(true), 3500);
      setTimeout(() => setShowButton(true), 4000);
    } else {
      setShowCounters(false);
      setShowMessage(false);
      setShowButton(false);
    }
  }, [isVisible, previousCO2, newCO2]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 100;
    const startCO2 = previousCO2;
    const startTrees = previousCO2 / TREE_CALCULATIONS.co2PerTreePerYear;
    const targetCO2 = newCO2;
    const targetTrees = newCO2 / TREE_CALCULATIONS.co2PerTreePerYear;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - (1 - progress) ** 3;

      const newDisplayCO2 = startCO2 + (targetCO2 - startCO2) * easedProgress;
      const newDisplayTrees =
        startTrees + (targetTrees - startTrees) * easedProgress;

      setDisplayCO2(newDisplayCO2);
      setDisplayTrees(newDisplayTrees);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayCO2(targetCO2);
        setDisplayTrees(targetTrees);
      }
    }, duration / steps);
  };

  const getImpactMessage = () => {
    switch (stepKey) {
      case "flightKm":
        if (Number(stepValue) === 0)
          return `✅ Great! No flying keeps your footprint low!`;
        return `✈️ Flying ${stepValue} km adds ${impact.toFixed(1)} kg CO₂ to your footprint`;
      case "trainKm":
        if (Number(stepValue) === 0) return `🚆 No train travel this time`;
        return `🚆 Excellent choice! Train travel is eco-friendly (+${impact.toFixed(1)} kg CO₂)`;
      case "busKm":
        if (Number(stepValue) === 0) return `🚌 No bus travel`;
        return `🚌 Good public transport choice! (+${impact.toFixed(1)} kg CO₂)`;
      case "carKm":
        if (Number(stepValue) === 0)
          return `🚗 Great! No car travel keeps emissions low!`;
        return `🚗 Car travel adds ${impact.toFixed(1)} kg CO₂`;
      case "food": {
        const days = Number(data.days) || 0;
        const perDayValue = FOOD_CO2_PER_DAY[stepValue] || 0;
        const foodMessages = {
          never: `🌱 Amazing! Vegetarian diet for ${days} days is planet-friendly! (+${impact.toFixed(1)} kg CO₂)`,
          rarely: `🥗 Great choice! Low meat consumption for ${days} days (+${impact.toFixed(1)} kg CO₂ / ${perDayValue} kg per day)`,
          sometimes: `🍖 Moderate meat consumption for ${days} days (+${impact.toFixed(1)} kg CO₂ / ${perDayValue} kg per day)`,
          "almost every day": `🥩 High meat consumption for ${days} days has significant impact (+${impact.toFixed(1)} kg CO₂ / ${perDayValue} kg per day)`,
          "every day": `🥩 Daily meat for ${days} days has major environmental impact (+${impact.toFixed(1)} kg CO₂ / ${perDayValue} kg per day)`,
        };
        return (
          foodMessages[stepValue] ||
          `🍽️ Food choice: +${impact.toFixed(1)} kg CO₂`
        );
      }
      case "electricity": {
        if (stepValue === "green energy") {
          return `♻️ Excellent! Green energy reduces your footprint (+${impact.toFixed(1)} kg CO₂)`;
        }
        const accCategory = data.accommodationCategory || "accommodation";
        const occupancy = data.roomOccupancy || "alone";
        return `🏨 ${accCategory} with ${stepValue} for ${data.days + 1} nights, ${occupancy} (+${impact.toFixed(1)} kg CO₂)`;
      }
      case "carType":
        return stepValue === "electric"
          ? `🔋 Excellent! Electric cars have 75% lower emissions!`
          : `⛽ Conventional car increases your footprint`;
      case "carPassengers":
        if (Number(stepValue) === 1) {
          return `🚗 Consider carpooling next time! Sharing rides can cut emissions by up to 75%.`;
        } else {
          return `👥 Great carpooling! You're reducing emissions by sharing with ${Number(stepValue) - 1} other${Number(stepValue) > 2 ? "s" : ""}.`;
        }
      default:
        if (impact < 0.1)
          return `✅ This choice doesn't affect your CO₂ footprint`;
        return isIncrease
          ? `+${impact.toFixed(1)} kg CO₂ added`
          : `-${impact.toFixed(1)} kg CO₂ saved`;
    }
  };

  const getImpactColor = () => {
    if (impact < 1) return "#28a745";
    if (impact < 20) return "#ffc107";
    if (impact < 100) return "#fd7e14";
    return "#dc3545";
  };

  if (!isVisible) return null;

  const getCO2Color = () => {
    if (displayCO2 <= 50) return "#28a745";
    if (displayCO2 <= 150) return "#ffc107";
    if (displayCO2 <= 300) return "#fd7e14";
    return "#dc3545";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: "42px", color: "white", marginBottom: "40px" }}>
          Your Impact
        </h2>

        <div
          style={{
            display: "flex",
            gap: "30px",
            justifyContent: "center",
            marginBottom: "40px",
            opacity: showCounters ? 1 : 0,
            transition: "opacity 1s",
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: "300px",
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "15px",
              border: "3px solid " + getCO2Color(),
            }}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🏭</div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                color: getCO2Color(),
                marginBottom: "10px",
              }}
            >
              {displayCO2.toFixed(1)} kg
            </div>
            <div
              style={{ fontSize: "16px", color: "#666", marginBottom: "10px" }}
            >
              Total CO₂
            </div>
            {isIncrease && impact > 0.1 && (
              <div
                style={{
                  fontSize: "18px",
                  color: "#dc3545",
                  fontWeight: "bold",
                }}
              >
                +{impact.toFixed(1)} kg
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              maxWidth: "300px",
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "15px",
              border: "3px solid #28a745",
            }}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🌳</div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                color: "#28a745",
                marginBottom: "10px",
              }}
            >
              {Math.ceil(displayTrees)}
            </div>
            <div
              style={{ fontSize: "16px", color: "#666", marginBottom: "10px" }}
            >
              Trees Needed
            </div>
            {isIncrease && impact > 0.1 && (
              <div
                style={{
                  fontSize: "18px",
                  color: "#dc3545",
                  fontWeight: "bold",
                }}
              >
                +{Math.ceil(impact / TREE_CALCULATIONS.co2PerTreePerYear)}
              </div>
            )}
          </div>
        </div>

        {showMessage && (
          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "15px",
              marginBottom: "30px",
              border: `3px solid ${getImpactColor()}`,
              opacity: showMessage ? 1 : 0,
              transition: "opacity 1s",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}
            >
              {getImpactMessage()}
            </div>
            {impact > 100 && (
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "18px",
                  color: "#dc3545",
                  fontWeight: "bold",
                }}
              >
                🚨 High Environmental Impact!
              </div>
            )}
          </div>
        )}

        {showButton && (
          <div
            style={{ opacity: showButton ? 1 : 0, transition: "opacity 1s" }}
          >
            <button
              onClick={onContinue}
              style={{
                padding: "20px 50px",
                fontSize: "20px",
                fontWeight: "bold",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
              }}
            >
              Continue to Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// CO2 CHART COMPONENT
// ========================================

function CO2Chart({ data }) {
  const categories = [
    { key: "flightCO2", label: "Flight", icon: "✈️", color: "#007bff" },
    { key: "trainCO2", label: "Train", icon: "🚆", color: "#28a745" },
    { key: "busCO2", label: "Bus", icon: "🚌", color: "#fd7e14" },
    { key: "carCO2", label: "Car", icon: "🚗", color: "#6f42c1" },
    { key: "foodCO2", label: "Food", icon: "🍖", color: "#dc3545" },
    {
      key: "accommodationCO2",
      label: "Accommodation & Energy",
      icon: "🏨",
      color: "#20c997",
    },
    {
      key: "activityCO2",
      label: "Project Activities",
      icon: "🎯",
      color: "#17a2b8",
    },
  ];

  const sortedCategories = categories
    .map((cat) => ({ ...cat, value: data[cat.key] || 0 }))
    .filter((cat) => cat.value > 0)
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...sortedCategories.map((cat) => cat.value), 1);

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "25px",
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
      }}
    >
      <h4 style={{ marginBottom: "20px", fontSize: "22px" }}>
        CO₂ Breakdown Chart
      </h4>
      <div>
        {sortedCategories.map((cat) => {
          const percentage = (cat.value / maxValue) * 100;

          return (
            <div key={cat.key} style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "20px", marginRight: "10px" }}>
                  {cat.icon}
                </span>
                <span style={{ flex: 1, fontWeight: "bold" }}>{cat.label}</span>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {cat.value.toFixed(1)} kg
                </span>
              </div>
              <div
                style={{
                  height: "25px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(percentage, 5)}%`,
                    height: "100%",
                    backgroundColor: cat.color,
                    transition: "width 0.5s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingLeft: "10px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {percentage > 15 && `${cat.value.toFixed(1)} kg`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// ORGANIZATION SELECTOR COMPONENT
// ========================================

function OrganizationSelector({ onSelect, onCreateNew }) {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = () => {
    const allOrgs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("organization_")) {
        const org = JSON.parse(localStorage.getItem(key));
        allOrgs.push(org);
      }
    }
    // Sort by name
    allOrgs.sort((a, b) => a.name.localeCompare(b.name));
    setOrganizations(allOrgs);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
          🌱 Greendex 2.0
        </h1>
        <p style={{ fontSize: "20px", color: "#666" }}>
          Select or Create an Organization
        </p>
      </div>

      {organizations.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
            📋 Existing Organizations ({organizations.length})
          </h2>
          <div style={{ display: "grid", gap: "15px" }}>
            {organizations.map((org) => {
              const employees = JSON.parse(
                localStorage.getItem(`employees_${org.id}`) || "[]",
              );
              const projects = JSON.parse(
                localStorage.getItem(`projects_${org.id}`) || "[]",
              );

              return (
                <div
                  key={org.id}
                  onClick={() => onSelect(org.id)}
                  style={{
                    padding: "25px",
                    backgroundColor: "white",
                    border: "2px solid #ddd",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#28a745";
                    e.currentTarget.style.backgroundColor = "#f0fff4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "22px" }}>
                      {org.name}
                    </h3>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      👥 {employees.length} team member
                      {employees.length !== 1 ? "s" : ""} | 📋 {projects.length}{" "}
                      project{projects.length !== 1 ? "s" : ""} | 📅 Created{" "}
                      {new Date(org.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: "32px", color: "#28a745" }}>→</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          border: "2px dashed #ddd",
        }}
      >
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>➕</div>
        <h3 style={{ marginBottom: "15px", fontSize: "22px" }}>
          Create New Organization
        </h3>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Start fresh with a new organization
        </p>
        <button
          onClick={onCreateNew}
          style={{
            padding: "15px 40px",
            fontSize: "18px",
            fontWeight: "bold",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Create New Organization
        </button>
      </div>
    </div>
  );
}

// ========================================
// Organization Setup
// ========================================
function OrganizationSetup({ onComplete }) {
  const [organizationName, setOrganizationName] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !organizationName.trim() ||
      !adminFirstName.trim() ||
      !adminLastName.trim()
    ) {
      setError("All fields are required");
      return;
    }
    const orgId = generateId("org");
    const primaryAdminId = generateId("emp");
    const organization = {
      id: orgId,
      name: organizationName.trim(),
      createdAt: new Date().toISOString(),
      primaryAdmin: primaryAdminId,
    };
    const primaryAdmin = {
      id: primaryAdminId,
      firstName: adminFirstName.trim(),
      lastName: adminLastName.trim(),
      systemRole: "admin",
      addedAt: new Date().toISOString(),
    };
    localStorage.setItem(`organization_${orgId}`, JSON.stringify(organization));
    localStorage.setItem(`employees_${orgId}`, JSON.stringify([primaryAdmin]));
    localStorage.setItem("currentOrganizationId", orgId);
    sessionStorage.setItem("currentEmployeeId", primaryAdminId);
    onComplete({ organization, primaryAdmin });
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        🌱 Welcome to Greendex!
      </h1>
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8d7da",
              marginBottom: "20px",
              borderRadius: "5px",
            }}
          >
            {error}
          </div>
        )}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Organization Name *
          </label>
          <input
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              First Name *
            </label>
            <input
              type="text"
              value={adminFirstName}
              onChange={(e) => setAdminFirstName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Last Name *
            </label>
            <input
              type="text"
              value={adminLastName}
              onChange={(e) => setAdminLastName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Create Organization
        </button>
      </form>
    </div>
  );
}

// ========================================
// APP PARTICIPANT - Complete Flow
// ========================================

function AppParticipant() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [project, setProject] = useState(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showIntroImpactScreen, setShowIntroImpactScreen] = useState(false);

  const [showImpactScreen, setShowImpactScreen] = useState(false);
  const [impactData, setImpactData] = useState({
    previousCO2: 0,
    newCO2: 0,
    stepKey: "",
    stepValue: "",
  });
  const [liveCO2, setLiveCO2] = useState(0);
  const [previousLiveCO2, setPreviousLiveCO2] = useState(0);
  const [showCounterAnimation, setShowCounterAnimation] = useState(false);

  // Calculate project days for validation
  const projectDays = project
    ? calculateProjectDays(project.start, project.end)
    : 7;

  const activeSteps = getActiveSteps(data);
  const currentStep = activeSteps[step];

  // Override days step with project days as default and max
  if (currentStep?.key === "days") {
    currentStep.defaultValue = projectDays; // ← Gleicher Name wie überall!
    currentStep.max = projectDays;
    currentStep.hint = `without travel days (max: ${projectDays} days)`;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("project");

    if (pid) {
      setProjectId(pid);

      const allOrganizers = Object.keys(localStorage).filter((key) =>
        key.startsWith("projects_"),
      );
      for (const orgKey of allOrganizers) {
        const projects = JSON.parse(localStorage.getItem(orgKey) || "[]");
        const foundProject = projects.find((p) => p.id === pid);
        if (foundProject) {
          setProject(foundProject);
          break;
        }
      }
    }

    // ⭐ NEU: Reset data on mount (für neue Participants)
    setData({});
    setStep(0);
    setResult(null);
    setShowWelcomeScreen(true);
    setShowIntroImpactScreen(false);
  }, []);

  useEffect(() => {
    if (
      currentStep &&
      currentStep.defaultValue !== undefined &&
      data[currentStep.key] === undefined
    ) {
      setData((prev) => ({
        ...prev,
        [currentStep.key]: currentStep.defaultValue,
      }));
    }
  }, [currentStep, data]);

  const handleChange = (e) => {
    let value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;

    // ⭐ Validate against max value
    if (
      e.target.type === "number" &&
      currentStep.max &&
      value > currentStep.max
    ) {
      value = currentStep.max;
    }

    // ⭐ Validate against min value
    if (
      e.target.type === "number" &&
      currentStep.min &&
      value < currentStep.min
    ) {
      value = currentStep.min;
    }

    setData({ ...data, [currentStep.key]: value });
  };

  const handleOption = (opt) => {
    setData({ ...data, [currentStep.key]: opt });
  };

  const showImpact = (stepKey, stepValue) => {
    const previousCO2 = liveCO2;
    const newCO2 = calculateLiveCO2(
      data,
      stepKey,
      stepValue,
      project?.activityTransport,
    );

    setImpactData({
      previousCO2,
      newCO2,
      stepKey,
      stepValue,
    });

    setPreviousLiveCO2(liveCO2);
    setLiveCO2(newCO2);
    setShowImpactScreen(true);
  };

  const hideImpactScreen = () => {
    setShowImpactScreen(false);
    setShowCounterAnimation(false);
  };

  const next = () => {
    if (currentStep.key === "carKm" && Number(data.carKm) > 0) {
      proceedToNext();
      return;
    }

    if (currentStep.key === "carType" && Number(data.carKm) > 0) {
      proceedToNext();
      return;
    }

    const shouldShowImpact = [
      "flightKm",
      "trainKm",
      "busKm",
      "carPassengers",
      "electricity",
      "food",
    ].includes(currentStep.key);

    if (currentStep.key === "carPassengers" && Number(data.carKm) === 0) {
      proceedToNext();
      return;
    }

    if (["flightKm", "trainKm", "busKm"].includes(currentStep.key)) {
      if (Number(data[currentStep.key]) === 0) {
        proceedToNext();
        return;
      }
    }

    if (shouldShowImpact) {
      const stepValue = data[currentStep.key];
      showImpact(currentStep.key, stepValue);
    } else {
      proceedToNext();
    }
  };

  const proceedToNext = () => {
    if (step < activeSteps.length - 1) {
      setStep(step + 1);
    } else {
      const finalData = { ...data };

      if (!finalData.carKm || finalData.carKm === 0) {
        finalData.carType = "conventional (diesel, petrol, gas…)";
        finalData.carPassengers = 1;
      }

      const res = calculateCO2(finalData, project?.activityTransport);
      setResult(res);

      if (projectId) {
        const key = `participants_${projectId}`;
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        const id = participantId || generateId("part");
        const newParticipant = {
          id,
          data: finalData,
          result: res,
          completedAt: new Date().toISOString(),
        };

        const updated = stored.filter((p) => p.id !== id);
        updated.push(newParticipant);
        localStorage.setItem(key, JSON.stringify(updated));
        setParticipantId(id);
      }
    }
  };

  const prev = () => {
    if (step > 0) {
      setStep(step - 1);
      const prevStepData = { ...data };
      delete prevStepData[currentStep?.key];
      const newCO2 = calculateLiveCO2(
        prevStepData,
        "",
        "",
        project?.activityTransport,
      );
      setLiveCO2(newCO2);
    }
  };

  const restartCalculation = () => {
    setResult(null);
    setStep(0);
    setData({});
    setParticipantId(null);
    setLiveCO2(0);
    setPreviousLiveCO2(0);
    setShowImpactScreen(false);
    setShowCounterAnimation(false);
    setShowWelcomeScreen(true);
    setShowIntroImpactScreen(false);
  };

  if (!projectId) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "80px", marginBottom: "30px" }}>⚠️</div>
          <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>
            No Project Selected
          </h2>
          <p style={{ fontSize: "18px", color: "#666" }}>
            You need a valid project link to participate in the CO₂ footprint
            calculation.
          </p>
          <p style={{ fontSize: "16px", color: "#999", marginTop: "20px" }}>
            Please ask your project organizer for the correct participation
            link.
          </p>
        </div>
      </div>
    );
  }

  if (showWelcomeScreen && project) {
    return (
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
            Greendex 2.0
          </h1>
          <h2 style={{ fontSize: "24px", color: "#666", marginBottom: "40px" }}>
            CO₂ Calculator for Erasmus+ Mobilities
          </h2>

          <div
            style={{
              padding: "30px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "40px",
              textAlign: "left",
            }}
          >
            <h3 style={{ fontSize: "28px", marginBottom: "15px" }}>
              📋 {project.name}
            </h3>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              📅 {project.start} - {project.end}
            </p>
            {project.location && (
              <p style={{ fontSize: "18px", marginBottom: "10px" }}>
                📍 {project.location}, {getCountryFlag(project.country)}{" "}
                {project.country}
              </p>
            )}

            {(project.activityTransport?.boat ||
              project.activityTransport?.bus ||
              project.activityTransport?.train ||
              project.activityTransport?.car) && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  🎯 Project Activities
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {project.activityTransport.boat > 0 && (
                    <span
                      style={{
                        padding: "5px 15px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "20px",
                      }}
                    >
                      🛥️ Boat: {project.activityTransport.boat}km
                    </span>
                  )}
                  {project.activityTransport.bus > 0 && (
                    <span
                      style={{
                        padding: "5px 15px",
                        backgroundColor: "#e8f5e9",
                        borderRadius: "20px",
                      }}
                    >
                      🚌 Bus: {project.activityTransport.bus}km
                    </span>
                  )}
                  {project.activityTransport.train > 0 && (
                    <span
                      style={{
                        padding: "5px 15px",
                        backgroundColor: "#f3e5f5",
                        borderRadius: "20px",
                      }}
                    >
                      🚆 Train: {project.activityTransport.train}km
                    </span>
                  )}
                  {project.activityTransport.car > 0 && (
                    <span
                      style={{
                        padding: "5px 15px",
                        backgroundColor: "#fff3e0",
                        borderRadius: "20px",
                      }}
                    >
                      🚗 Car: {project.activityTransport.car}km
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {project.welcomeMessage && (
            <div
              style={{
                padding: "25px",
                backgroundColor: "#e8f5e9",
                borderRadius: "10px",
                marginBottom: "40px",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>👋</div>
              <div style={{ fontSize: "18px", color: "#333" }}>
                {project.welcomeMessage}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setShowWelcomeScreen(false);
              setShowIntroImpactScreen(true);
            }}
            style={{
              padding: "20px 50px",
              fontSize: "20px",
              fontWeight: "bold",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
            }}
          >
            Start Greendex
          </button>
        </div>
      </div>
    );
  }

  if (showIntroImpactScreen && project) {
    return (
      <IntroImpactScreen
        project={project}
        onComplete={(firstName, country) => {
          // ⭐ NEU: 2 Parameter!
          console.log("🎯 ONCOMPLETE CALLED!", firstName, country);

          setData((prev) => ({ ...prev, firstName, country })); // ⭐ Speichere beide!

          // Track started participant with country
          const newParticipantId = participantId || generateId("part");
          if (!participantId) {
            setParticipantId(newParticipantId);
          }

          const startedParticipants = JSON.parse(
            localStorage.getItem(`participants_started_${projectId}`) || "[]",
          );

          const alreadyExists = startedParticipants.find(
            (p) => p.id === newParticipantId,
          );
          if (!alreadyExists) {
            startedParticipants.push({
              id: newParticipantId,
              firstName: firstName,
              country: country, // ⭐ Country ist jetzt direkt verfügbar!
              startedAt: new Date().toISOString(),
            });
            localStorage.setItem(
              `participants_started_${projectId}`,
              JSON.stringify(startedParticipants),
            );
            console.log(
              "🟢 Started participant saved:",
              newParticipantId,
              firstName,
              country,
            );
          }

          let activityCO2 = 0;
          if (project.activityTransport) {
            activityCO2 += (project.activityTransport.boat || 0) * 0.5;
            activityCO2 +=
              (project.activityTransport.bus || 0) * CO2_PER_KM.bus;
            activityCO2 +=
              (project.activityTransport.train || 0) * CO2_PER_KM.train;
            activityCO2 +=
              (project.activityTransport.car || 0) * CO2_PER_KM.car;
          }
          setLiveCO2(activityCO2);
          setPreviousLiveCO2(activityCO2);

          setShowIntroImpactScreen(false);
        }}
      />
    );
  }

  if (result) {
    return (
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
            🌱 Your CO₂ Footprint
          </h1>
          {project && (
            <p style={{ fontSize: "20px", color: "#666" }}>
              Project: {project.name}
            </p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              👤 Name
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {data.firstName || "N/A"}
            </div>
          </div>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              🎂 Age
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {data.age || "N/A"}
            </div>
          </div>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              🌍 Country
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {data.country ? getCountryFlag(data.country, "20px") : null}
              <span>{data.country || "N/A"}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              padding: "40px",
              backgroundColor: "#e3f2fd",
              borderRadius: "15px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                margin: "0 0 10px 0",
                color: "#1976d2",
              }}
            >
              {result.total.toFixed(2)} kg
            </h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#666" }}>
              Total CO₂ Footprint
            </p>
          </div>
          <div
            style={{
              padding: "40px",
              backgroundColor: "#e8f5e9",
              borderRadius: "15px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "48px", margin: "0 0 10px 0" }}>
              🌳 {Math.ceil(result.treesPerYear)}
            </h3>
            <p style={{ margin: 0, fontSize: "16px", color: "#666" }}>
              Trees working 1 year
            </p>
            <small style={{ color: "#999" }}>to absorb this CO₂</small>
          </div>
          <div
            style={{
              padding: "40px",
              backgroundColor: "#fff3e0",
              borderRadius: "15px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "48px", margin: "0 0 10px 0" }}>
              🌱 {Math.ceil(result.treesToPlant)}
            </h3>
            <p style={{ margin: 0, fontSize: "16px", color: "#666" }}>
              Trees to plant
            </p>
            <small style={{ color: "#999" }}>for 100-year offset</small>
          </div>
        </div>

        <CO2Chart data={result} />

        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <button
            onClick={restartCalculation}
            style={{
              padding: "15px 40px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🔄 Calculate Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>⚠️ Error</h2>
        <p>Something went wrong with the questionnaire. Please try again.</p>
        <button
          onClick={restartCalculation}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🔄 Restart
        </button>
      </div>
    );
  }

  const progress = ((step + 1) / activeSteps.length) * 100;

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
      <ImpactScreen
        previousCO2={impactData.previousCO2}
        newCO2={impactData.newCO2}
        stepKey={impactData.stepKey}
        stepValue={impactData.stepValue}
        isVisible={showImpactScreen}
        data={data}
        onContinue={() => {
          hideImpactScreen();
          proceedToNext();
        }}
      />

      {project && !showImpactScreen && (
        <div
          style={{
            padding: "25px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
            Greendex 2.0 | CO₂ Calculator
          </h2>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
            {project.name}
          </p>
          <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
            📅 {project.start} - {project.end}
            {project.location &&
              ` | 📍 ${project.location}, ${project.country}`}
          </p>
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            height: "12px",
            backgroundColor: "#e9ecef",
            borderRadius: "6px",
            overflow: "hidden",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#28a745",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            Step {step + 1} of {activeSteps.length}
          </p>
          {activeSteps.length < steps.length && (
            <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>
              ({steps.length - activeSteps.length} questions automatically
              skipped)
            </p>
          )}
        </div>
      </div>

      {!showImpactScreen && (
        <LiveCounter
          co2Value={liveCO2}
          treesValue={liveCO2 / TREE_CALCULATIONS.co2PerTreePerYear}
          previousCO2={previousLiveCO2}
          showAnimation={showCounterAnimation}
        />
      )}

      <div
        style={{
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "28px", marginBottom: "15px" }}>
          {currentStep.title}
        </h2>
        {currentStep.hint && (
          <p style={{ color: "#666", fontSize: "16px", marginBottom: "25px" }}>
            {currentStep.hint}
          </p>
        )}

        {currentStep.type === "number" && (
          <input
            type="number"
            min={currentStep.min || 0}
            max={currentStep.max} // ⭐ NEU: Respektiert das Maximum
            value={
              data[currentStep.key] !== undefined
                ? data[currentStep.key]
                : currentStep.defaultValue || ""
            }
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "18px",
              borderRadius: "8px",
              border: "2px solid #ddd",
            }}
            placeholder={
              currentStep.defaultValue
                ? `Default: ${currentStep.defaultValue}`
                : "Enter a number"
            } // ⭐ NEU: Besserer Text
          />
        )}

        {currentStep.type === "select" && (
          <select
            value={data[currentStep.key] || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "18px",
              borderRadius: "8px",
              border: "2px solid #ddd",
            }}
          >
            <option value="">-- Select a country --</option>
            {currentStep.options.map((opt) => (
              <option key={opt} value={opt}>
                {getCountryFlag(opt)} {opt}
              </option>
            ))}
          </select>
        )}

        {currentStep.type === "options" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {currentStep.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleOption(opt)}
                style={{
                  padding: "18px",
                  fontSize: "16px",
                  fontWeight: data[currentStep.key] === opt ? "bold" : "normal",
                  backgroundColor:
                    data[currentStep.key] === opt ? "#28a745" : "white",
                  color: data[currentStep.key] === opt ? "white" : "#333",
                  border: `2px solid ${data[currentStep.key] === opt ? "#28a745" : "#ddd"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
          <button
            onClick={prev}
            disabled={step === 0}
            style={{
              flex: 1,
              padding: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: step === 0 ? "#e9ecef" : "#6c757d",
              color: step === 0 ? "#999" : "white",
              border: "none",
              borderRadius: "8px",
              cursor: step === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>
          <button
            onClick={next}
            disabled={currentStep.type === "options" && !data[currentStep.key]}
            style={{
              flex: 1,
              padding: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor:
                currentStep.type === "options" && !data[currentStep.key]
                  ? "#e9ecef"
                  : "#28a745",
              color:
                currentStep.type === "options" && !data[currentStep.key]
                  ? "#999"
                  : "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentStep.type === "options" && !data[currentStep.key]
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {step === activeSteps.length - 1 ? "Calculate CO₂" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MAIN APP COMPONENT - Router (ERSETZT DIE ALTE APP KOMPONENTE!)
// ========================================

function App() {
  const [view, setView] = useState("organizer");

  useEffect(() => {
    if (
      window.location.pathname.includes("/participant/") ||
      new URLSearchParams(window.location.search).get("project")
    ) {
      setView("participant");
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: "#28a745",
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>🌱 Greendex 2.0</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
            CO₂ Footprint Calculator
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setView("organizer")}
            style={{
              padding: "12px 24px",
              backgroundColor: view === "organizer" ? "white" : "transparent",
              color: view === "organizer" ? "#28a745" : "white",
              border: "2px solid white",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
          >
            👥 Organizer
          </button>
          <button
            onClick={() => setView("participant")}
            style={{
              padding: "12px 24px",
              backgroundColor: view === "participant" ? "white" : "transparent",
              color: view === "participant" ? "#28a745" : "white",
              border: "2px solid white",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
          >
            📊 Participant
          </button>
        </div>
      </nav>

      <main style={{ minHeight: "calc(100vh - 180px)" }}>
        {view === "organizer" ? <AppOrganizer /> : <AppParticipant />}
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "30px 20px",
          backgroundColor: "white",
          color: "#666",
          borderTop: "2px solid #e9ecef",
          marginTop: "60px",
        }}
      >
        <p style={{ margin: 0, fontSize: "16px" }}>
          Greendex 2.0 - CO₂ Footprint Calculator for Erasmus+ Mobilities 🌍
        </p>
        <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#999" }}>
          Help save our planet, one project at a time!
        </p>
      </footer>
    </div>
  );
}

export default App;
