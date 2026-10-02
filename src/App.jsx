import { lazy, Suspense, useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import Hero from "./components/Hero";
import FeaturedMission from "./components/FeaturedMission";
import About from "./components/About";
import ProblemStatements from "./components/ProblemStatements";
import RulesTimeline from "./components/RulesTimeline";
import Prizes from "./components/Prizes";
import FAQs from "./components/FAQs";
import CoreTeam from "./components/CoreTeam";
import Ticker from "./components/Ticker";
import Contact from "./components/Contact";
import MainLayout from "./layouts/MainLayout";
import { SPLASH_EXIT_MS, SPLASH_MS } from "./data/site";
import "./components/Registration.css";

/* Firebase is heavy and only needed for registration, so it loads on demand. */
const Registration = lazy(() => import("./components/Registration"));

/* active → exiting (charge flash) → hidden (hero revealed) */
const PHASE = { ACTIVE: "active", EXITING: "exiting", HIDDEN: "hidden" };

function RegistrationFallback() {
  return (
    <section className="section register-section">
      <header className="section-header">
        <span className="section-kicker">Registration</span>
        <h2 className="section-title">Access the Mission</h2>
        <div className="section-line" />
      </header>
      <div className="terminal" aria-busy="true">
        <div className="terminal-bar">
          <span className="terminal-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="terminal-title">BIOBYTE_REGISTRATION</span>
          <span className="terminal-status">
            <span className="status-dot" aria-hidden="true" />
            LINKING
          </span>
        </div>
        <div className="terminal-body">
          <p className="pane-log">
            <span>&gt;</span> Opening registration…
          </p>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [splashPhase, setSplashPhase] = useState(PHASE.ACTIVE);

  /* Keep CSS animations in lockstep with the JS timers */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--splash-ms", `${SPLASH_MS}ms`);
    root.style.setProperty("--splash-exit", `${SPLASH_EXIT_MS}ms`);
  }, []);

  /* Both timers are created together and cleared on unmount, so the intro
     always resolves — even if the tab is throttled mid-animation. */
  useEffect(() => {
    const beginExit = setTimeout(
      () => setSplashPhase(PHASE.EXITING),
      SPLASH_MS,
    );
    const finish = setTimeout(
      () => setSplashPhase(PHASE.HIDDEN),
      SPLASH_MS + SPLASH_EXIT_MS,
    );

    return () => {
      clearTimeout(beginExit);
      clearTimeout(finish);
    };
  }, []);

  return (
    <>
      {splashPhase !== PHASE.HIDDEN && (
        <SplashScreen phase={splashPhase} />
      )}

      <MainLayout>
        <Hero />
        <FeaturedMission />
        <About />
        <ProblemStatements />
        <Suspense fallback={<RegistrationFallback />}>
          <Registration />
        </Suspense>
        <RulesTimeline />
        <Prizes />
        <FAQs />
        <CoreTeam />
        <Ticker />
        <Contact />
      </MainLayout>
    </>
  );
}

export default App;
