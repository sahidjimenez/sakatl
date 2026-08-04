import type { Metadata } from "next";
import Link from "next/link";
import HomeNav from "./HomeNav";
import { CreateRoutineCTA } from "./CreateRoutineCTA";
import { StatsRow } from "./components/home/StatsRow";
import { DynamicAppMockup } from "./components/home/DynamicHomeSections";
import { LayersIcon, CheckCircleIcon, UsersIcon, PlayCircleIcon } from "./components/home/FeatureIcons";
import { getHomeStats } from "@/lib/home-stats";
import "./home.css";

export const metadata: Metadata = {
  title: "Sakatl — rutinas que se hacen juntos",
  description:
    "Sakatl es donde armas tu rutina de ejercicio — series simples, bi-series o tri-series — y la sigues junto a otros, cada quien a su paso.",
};

export default async function Home() {
  const stats = await getHomeStats();

  return (
    <div className="home-page">
      <HomeNav />

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
            <CreateRoutineCTA label="Crear mi rutina" className="btn btn-primary" />
            <Link href="/comunidad">
              <button type="button" className="btn btn-ghost">Ver rutinas de la comunidad</button>
            </Link>
          </div>
        </section>

        <section className="frontpage" aria-label="Sakatl, en números">
          <StatsRow stats={stats} />
        </section>

        <section className="features" id="rutinas">
          <span className="kicker">Cómo funciona</span>
          <div className="cols">
            <div className="col">
              <div className="col-icon">
                <LayersIcon />
              </div>
              <h2>Arma tu rutina, a tu manera</h2>
              <p>
                Agrega ejercicios sueltos o agrúpalos en bi-series y
                tri-series sin descanso entre ellos. Reordena, separa o
                vuelve a agrupar cuando quieras — la rutina es tuya y cambia
                contigo.
              </p>
            </div>
            <div className="col">
              <div className="col-icon">
                <CheckCircleIcon />
              </div>
              <h2>Marca cada serie en el momento</h2>
              <p>
                Durante la sesión, cada serie se marca con un check y anota
                el peso usado y las repeticiones logradas. El registro queda
                listo para revisar tu progreso más tarde, sin hojas sueltas.
              </p>
            </div>
            <div className="col">
              <div className="col-icon">
                <UsersIcon />
              </div>
              <h2>Cada quien a su paso, juntos</h2>
              <p>
                Únete a la rutina de alguien más y síguela cuando te
                convenga. Ves quién más la sigue y su constancia, sin
                depender de coincidir en horario.
              </p>
            </div>
            <div className="col">
              <div className="col-icon">
                <PlayCircleIcon />
              </div>
              <h2>Cada ejercicio, explicado</h2>
              <p>
                La biblioteca de ejercicios trae animación y pasos en
                español para cada movimiento — útil si no conoces el nombre
                o quieres confirmar la forma correcta antes de cargar peso.
              </p>
            </div>
          </div>
        </section>

        <section className="steps" aria-label="Cómo empezar">
          <span className="kicker">Cómo empezar</span>
          <div className="steps-list">
            <div className="step">
              <span className="step-num">1</span>
              <h3>Pruébalo sin cuenta</h3>
              <p>
                El modo invitado guarda tu rutina en este navegador y te
                deja pedirle una rutina a la IA una vez por semana, sin
                registrarte.
              </p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <h3>Arma tu rutina, o pídesela al asistente</h3>
              <p>
                Elige tus ejercicios bloque por bloque, o describe tu
                objetivo en el chat y te propone una rutina completa lista
                para guardar.
              </p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <h3>Entrena y créate una cuenta cuando quieras</h3>
              <p>
                Marca tus series, revisa tu historial, y cuando quieras
                conservar tu progreso y seguir rutinas de otros, crea tu
                cuenta gratis.
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
              <DynamicAppMockup />
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
            <figcaption>— La idea detrás de Sakatl</figcaption>
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
            <CreateRoutineCTA label="Empezar" className="btn btn-primary" />
          </div>
        </section>

        <footer className="footer">
          <p>Sakatl — rutinas que se hacen juntos.</p>
          <p className="footer-credit">Creado por Sahid A. Jimenez Cazan</p>
        </footer>
      </div>
    </div>
  );
}
