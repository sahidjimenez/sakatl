import type { Metadata } from "next";
import Link from "next/link";
import "./home.css";

export const metadata: Metadata = {
  title: "Sakatl — rutinas que se hacen juntos",
  description:
    "Sakatl es donde armas tu rutina de ejercicio — series simples, bi-series o tri-series — y la sigues junto a otros, cada quien a su paso.",
};

export default function Home() {
  return (
    <div className="home-page">
      <nav className="nav">
        <span className="nav-brand">Sakatl</span>
        <div className="nav-links">
          <a href="#rutinas" aria-current="location">Rutinas</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#registro">Registro</a>
          <Link href="/ejercicios">Ejercicios</Link>
          <Link href="/app?view=desktop">
            <button type="button" className="btn btn-ghost">Entrar</button>
          </Link>
        </div>
      </nav>

      <div className="wrap">
        <section className="hero">
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
            <Link href="/app?view=mobile">
              <button type="button" className="btn btn-primary">Crear mi rutina</button>
            </Link>
            <Link href="/app?view=mobile">
              <button type="button" className="btn btn-ghost">Ver rutinas de la comunidad</button>
            </Link>
          </div>
        </section>

        <section className="frontpage" aria-label="Sakatl, en números">
          <div className="index">
            <p className="ix">
              <span className="ix-label">Personas siguiendo rutinas hoy</span>
              <span className="ix-num spot">312</span>
            </p>
            <p className="ix">
              <span className="ix-label">Rutinas creadas por usuarios</span>
              <span className="ix-num">1,204</span>
            </p>
            <p className="ix">
              <span className="ix-label">Series registradas esta semana</span>
              <span className="ix-num">8,940</span>
            </p>
            <p className="ix">
              <span className="ix-label">Bloques por rutina, en promedio</span>
              <span className="ix-num">4</span>
            </p>
          </div>
        </section>

        <section className="features" id="rutinas">
          <span className="kicker">Cómo funciona</span>
          <div className="cols">
            <div className="col">
              <h2>Arma tu rutina, a tu manera</h2>
              <p>
                Agrega ejercicios sueltos o agrúpalos en bi-series y
                tri-series sin descanso entre ellos. Reordena, separa o
                vuelve a agrupar cuando quieras — la rutina es tuya y cambia
                contigo.
              </p>
            </div>
            <div className="col">
              <h2>Marca cada serie en el momento</h2>
              <p>
                Durante la sesión, cada serie se marca con un check y anota
                el peso usado y las repeticiones logradas. El registro queda
                listo para revisar tu progreso más tarde, sin hojas sueltas.
              </p>
            </div>
            <div className="col">
              <h2>Cada quien a su paso, juntos</h2>
              <p>
                Únete a la rutina de alguien más y síguela cuando te
                convenga. Ves quién más la sigue y su constancia, sin
                depender de coincidir en horario.
              </p>
            </div>
          </div>
        </section>

        <section className="split" id="comunidad">
          <div className="split-copy">
            <span className="kicker">El asistente</span>
            <h2 className="split-title">Pide una rutina, o pide ayuda</h2>
            <p className="note">
              Cuando no sabes qué entrenar, o sientes que algo falta en tu
              semana, el chat te recomienda ejercicios y rutinas completas
              organizadas en bloques — pensadas para lo que ya vienes
              haciendo.
            </p>
          </div>
          <figure className="split-figure">
            <div className="box">
              <TrainingPhotoPlaceholder />
            </div>
          </figure>
        </section>

        <section className="quote">
          <figure>
            <blockquote>
              &ldquo;Dejé de perder mis anotaciones en el celular. Ahora
              entro, marco la serie, y sigo — mi grupo ve que ya la
              hice.&rdquo;
            </blockquote>
            <figcaption>— Marco Ruiz, sigue Push Day</figcaption>
          </figure>
        </section>

        <section className="close" id="registro">
          <h3>Tu próxima rutina te está esperando</h3>
          <p className="sub">
            Crea tu cuenta gratis, arma tu primera rutina en minutos, o pide
            al asistente que te recomiende una.
          </p>
          <div className="signup">
            <input
              className="input"
              type="email"
              placeholder="tu@correo.com"
              aria-label="Correo electrónico"
            />
            <Link href="/app?view=desktop">
              <button type="button" className="btn btn-primary">Empezar</button>
            </Link>
          </div>
        </section>

        <footer className="footer">Sakatl — rutinas que se hacen juntos.</footer>
      </div>
    </div>
  );
}

function TrainingPhotoPlaceholder() {
  return (
    <div
      role="img"
      aria-label="Fotografía de alguien entrenando"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1c2026 0%, #14171b 60%, #0d0f12 100%)",
      }}
    >
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 8.5v7M17.5 8.5v7M3 10.5v3M21 10.5v3M6.5 12h11"
          stroke="#4ade80"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
