import type { Metadata } from "next";
import Link from "next/link";
import HomeNav from "./HomeNav";
import { CreateRoutineCTA } from "./CreateRoutineCTA";
import { StatsRow } from "./components/home/StatsRow";
import { DynamicAppMockup, DynamicAssistantChat } from "./components/home/DynamicHomeSections";
import { BuilderDemo } from "./components/home/BuilderDemo";
import { CommunityTeaser } from "./components/home/CommunityTeaser";
import { CheckGlyph, CircleGlyph, PlayGlyph, BarsGlyph } from "./components/home/IconGlyphs";
import { getHomeStats } from "@/lib/home-stats";
import { getHomeCommunityRoutines } from "@/lib/home-community";
import "./home.css";

export const metadata: Metadata = {
  title: "Sakatl — rutinas que se hacen juntos",
  description:
    "Sakatl es donde armas tu rutina de ejercicio — series simples, bi-series o tri-series — y la sigues junto a otros, cada quien a su paso.",
};

export default async function Home() {
  const [stats, communityRoutines] = await Promise.all([getHomeStats(), getHomeCommunityRoutines()]);

  return (
    <div className="home-page">
      <HomeNav />

      <div className="hero-section">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="wrap hero">
          <div>
            <div className="badge">
              <span className="badge-dot" />
              Modo invitado — pruébalo sin crear cuenta
            </div>
            <h1 className="display">
              Tu rutina.
              <br />
              <span className="accent">Su ritmo.</span>
            </h1>
            <p className="sub">
              Sakatl es donde armas tu rutina — series simples, bi-series o
              tri-series — y la sigues junto a otros, cada quien a su paso.
              Marca cada serie, anota peso y repeticiones, y pide al asistente
              lo que te falte.
            </p>
            <div className="row">
              <CreateRoutineCTA label="Crear mi rutina" className="btn btn-primary" />
              <Link href="/comunidad">
                <button type="button" className="btn btn-ghost">Ver rutinas de la comunidad</button>
              </Link>
            </div>
            <div className="avatars-row">
              <div className="avatars">
                <span className="avatar">SJ</span>
                <span className="avatar">MR</span>
                <span className="avatar">AL</span>
              </div>
              Rutinas que se hacen juntos, sin depender del horario
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-glow" />
            <div className="hero-card">
              <DynamicAppMockup />
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <section className="frontpage" aria-label="Sakatl, en números">
          <StatsRow stats={stats} />
        </section>

        <section className="features" id="rutinas">
          <div className="section-head">
            <div>
              <span className="kicker">Cómo funciona</span>
              <h2>
                Armar, marcar,
                <br />
                seguir a alguien más
              </h2>
            </div>
            <p className="lead">Cuatro cosas que hace Sakatl y que no necesitas resolver con notas en el celular.</p>
          </div>

          <div className="bento">
            <div className="card card-wide">
              <div>
                <div className="card-icon">
                  <CircleGlyph />
                </div>
                <h3>Arma tu rutina, a tu manera</h3>
                <p>
                  Ejercicios sueltos o agrupados en bi-series y tri-series sin
                  descanso entre ellos. Reordena, separa o vuelve a agrupar
                  cuando quieras.
                </p>
              </div>
              <BuilderDemo />
            </div>

            <div className="card">
              <div className="card-icon">
                <CheckGlyph />
              </div>
              <h3>Marca cada serie en el momento</h3>
              <p>
                Cada serie se marca con un check y anotas el peso y las
                repeticiones logradas. El registro queda listo para
                revisarlo después, sin hojas sueltas.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">
                <CircleGlyph />
              </div>
              <h3>Cada quien a su paso, juntos</h3>
              <p>
                Únete a la rutina de alguien más y síguela cuando te
                convenga. Ves quién más la sigue y su constancia, sin
                coincidir en horario.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">
                <PlayGlyph />
              </div>
              <h3>Cada ejercicio, explicado</h3>
              <p>
                La biblioteca trae animación y pasos en español para cada
                movimiento — útil si no conoces el nombre o quieres
                confirmar la forma antes de cargar peso.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">
                <BarsGlyph />
              </div>
              <h3>Tu historial, en una línea</h3>
              <p>
                Cada sesión guardada alimenta tu progreso por ejercicio:
                cuánto levantaste la última vez y cuánto llevas esta semana.
              </p>
            </div>
          </div>
        </section>

        <section className="steps" aria-label="Cómo empezar">
          <span className="kicker">Cómo empezar</span>
          <div className="step-list">
            <div className="step-list-top-line" />
            <div className="step">
              <span className="step-num">1</span>
              <span className="step-rail-line" />
              <h3>Pruébalo sin cuenta</h3>
              <p>
                El modo invitado guarda tu rutina en este navegador y te
                deja pedirle una rutina a la IA una vez por semana, sin
                registrarte.
              </p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <span className="step-rail-line" />
              <h3>Arma tu rutina, o pídesela al asistente</h3>
              <p>
                Elige tus ejercicios bloque por bloque, o describe tu
                objetivo en el chat y te propone una rutina completa lista
                para guardar.
              </p>
            </div>
            <div className="step step-muted">
              <span className="step-num">3</span>
              <span className="step-rail-line" />
              <h3>Entrena y créate una cuenta cuando quieras</h3>
              <p>
                Marca tus series, revisa tu historial y, cuando quieras
                conservar el progreso y seguir rutinas de otros, crea tu
                cuenta gratis.
              </p>
            </div>
          </div>
        </section>

        <section className="assistant">
          <div className="split">
            <div className="split-figure-order">
              <div className="chat-card-frame">
                <DynamicAssistantChat />
              </div>
            </div>
            <div className="split-copy">
              <span className="kicker">El asistente</span>
              <h2 className="split-title">
                Pide una rutina,
                <br />
                o pide ayuda
              </h2>
              <p className="note">
                Cuando no sabes qué entrenar, o sientes que algo falta en tu
                semana, el chat te recomienda ejercicios y rutinas completas
                organizadas en bloques — pensadas para lo que ya vienes
                haciendo.
              </p>
              <div className="assistant-checks">
                <div className="check-row">
                  <span className="mark">✓</span>
                  <span>Rutinas completas en bloques, listas para guardar</span>
                </div>
                <div className="check-row">
                  <span className="mark">✓</span>
                  <span>Sustituye un ejercicio si no tienes el equipo</span>
                </div>
                <div className="check-row">
                  <span className="mark">✓</span>
                  <span>Una petición por semana en modo invitado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="community" id="comunidad">
          <div className="section-head">
            <div>
              <span className="kicker">La comunidad</span>
              <h2 style={{ fontSize: 36 }}>Súmate a una rutina que ya funciona</h2>
            </div>
            <Link href="/comunidad" className="cta-link">Ver todas →</Link>
          </div>
          <CommunityTeaser routines={communityRoutines} />
        </section>

        <section className="quote">
          <figure className="quote-inner">
            <div className="quote-mark">&ldquo;</div>
            <div>
              <blockquote>
                Dejé de perder mis anotaciones en el celular. Ahora entro,
                marco la serie, y sigo — mi grupo ve que ya la hice.
              </blockquote>
              <figcaption>— La idea detrás de Sakatl</figcaption>
            </div>
          </figure>
        </section>

        <section className="close" id="registro">
          <div className="cta-panel">
            <div className="cta-glow" />
            <div className="inner">
              <h3>Tu próxima rutina te está esperando</h3>
              <p className="sub">
                Crea tu cuenta gratis, arma tu primera rutina en minutos, o
                pide al asistente que te recomiende una.
              </p>
              <div className="signup">
                <input
                  className="input"
                  type="email"
                  placeholder="tu@correo.com"
                  aria-label="Correo electrónico"
                />
                <CreateRoutineCTA label="Empezar" className="btn btn-primary" />
              </div>
              <div className="cta-note">Gratis para siempre · o entra primero en modo invitado</div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">Sakatl</div>
              <p className="footer-tag">Rutinas que se hacen juntos, cada quien a su paso.</p>
            </div>
            <div className="footer-col">
              <span className="footer-heading">Producto</span>
              <a href="#rutinas">Rutinas</a>
              <Link href="/ejercicios">Ejercicios</Link>
              <a href="#comunidad">Asistente</a>
            </div>
            <div className="footer-col">
              <span className="footer-heading">Comunidad</span>
              <Link href="/comunidad">Rutinas públicas</Link>
              <a href="#comunidad">Constancia</a>
            </div>
            <div className="footer-col">
              <span className="footer-heading">Cuenta</span>
              <Link href="/sign-in">Entrar</Link>
              <Link href="/invitado">Modo invitado</Link>
            </div>
          </div>
          <div className="footer-credit">Creado por Sahid A. Jiménez Cazán</div>
        </footer>
      </div>

      <div className="mobile-sticky-cta">
        <CreateRoutineCTA label="Crear mi rutina" className="btn btn-primary" />
        <Link href="/invitado" className="pill-guest">Invitado</Link>
      </div>
    </div>
  );
}
