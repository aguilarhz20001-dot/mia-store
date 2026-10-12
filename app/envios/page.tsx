import { MapPin, Truck, Store, MessageCircle, ShieldCheck, Heart, ChevronRight } from "lucide-react";
import DecoratedHero from "@/components/DecoratedHero";
import DeliveryCard from "@/components/DeliveryCard";
import Reveal from "@/components/Reveal";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { getDeliveryOption } from "@/lib/shipping";
import { formatQ } from "@/lib/format";
import { INSTAGRAM_URL, whatsappLink } from "@/lib/contact";

export const metadata = { title: "Envíos y entregas — Mia Store" };

const STEPS = [
  "Elige tus productos y agrégalos al carrito.",
  "Completa tus datos y envía el pedido por WhatsApp.",
  "Te confirmamos disponibilidad, total y forma de pago.",
  "Recibes tu pedido en el punto de encuentro o por paquetería.",
];

const REASSURANCE = [
  { icon: ShieldCheck, title: "Compra segura", note: "" },
  { icon: Heart, title: "Tu pedido", note: "en buenas manos" },
  { icon: Truck, title: "Seguimiento", note: "por WhatsApp" },
];

const BUTTON = "btn-primary inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 text-sm font-semibold";

function WhatsAppAction({ message, icon: Icon, children }: { message: string; icon: typeof MapPin; children: string }) {
  return (
    <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={BUTTON}>
      <Icon size={17} />
      {children}
      <ChevronRight size={16} />
    </a>
  );
}

export default function EnviosPage() {
  const nacional = getDeliveryOption("nacional");

  return (
    <>
      <DecoratedHero
        variant="envios"
        title={
          <>
            Tu pedido,{" "}
            <span className="inline-block bg-gradient-to-r from-brand-pink to-brand-pink-dark bg-clip-text px-1 pb-1 text-transparent">
              hasta donde estés
            </span>
          </>
        }
        description="Elige la forma de recibir tus compras de Mia Store"
      />

      <section className="mx-auto mt-4 grid max-w-2xl gap-5 px-5 sm:px-8 xl:max-w-[88rem] xl:grid-cols-3">
        <Reveal>
          <DeliveryCard
            icon={MapPin}
            tag="¡Gratis!"
            title="Entrega en Chimaltenango"
            description="Te llevamos tu pedido a un punto de encuentro en Chimaltenango. Coordinamos el lugar y la hora contigo por WhatsApp."
            image={{ src: "/envios/entrega-chimaltenango.webp", width: 760, height: 825 }}
            action={
              <WhatsAppAction icon={MapPin} message="Hola Mia Store, quiero coordinar una entrega en Chimaltenango.">
                Coordinar entrega
              </WhatsAppAction>
            }
          />
        </Reveal>

        <Reveal delay={0.07}>
          <DeliveryCard
            icon={Truck}
            tag={formatQ(nacional.fee)}
            title="Envíos a todo el país"
            description="Enviamos tu pedido a cualquier parte de Guatemala por paquetería. El costo puede variar según la ubicación o la empresa de mensajería."
            image={{ src: "/envios/envios-nacionales.webp", width: 760, height: 851 }}
            action={
              <WhatsAppAction icon={Truck} message="Hola Mia Store, quiero consultar el envío a mi departamento.">
                Consultar envío
              </WhatsAppAction>
            }
          />
        </Reveal>

        <Reveal delay={0.14}>
          <DeliveryCard
            icon={Store}
            tag="Próximamente"
            tagTone="lilac"
            title="Recoger en tienda"
            description="Estamos planeando abrir nuestra tienda física. Síguenos en redes para ser de las primeras en enterarte."
            image={{ src: "/envios/proximamente-tienda.webp", width: 760, height: 884 }}
            action={
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 text-sm font-semibold"
              >
                <InstagramIcon className="h-4 w-4" />
                Síguenos en Instagram
              </a>
            }
          />
        </Reveal>
      </section>

      <section className="mx-auto mt-8 max-w-[88rem] px-5 sm:px-8">
        <Reveal>
          <div className="rounded-[2rem] bg-gradient-to-r from-brand-pink-light via-brand-lilac-light/80 to-brand-pink-light px-6 py-6 ring-1 ring-brand-pink/20 sm:px-10">
            <div className="grid items-center gap-6 lg:grid-cols-[1.3fr_1.5fr_1fr]">
              <a
                href={whatsappLink("Hola Mia Store, tengo una consulta sobre envíos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink to-brand-lilac text-white shadow-md shadow-brand-pink/30">
                  <MessageCircle size={30} />
                </span>
                <span>
                  <span className="block font-script text-2xl font-bold leading-tight text-brand-ink transition-colors group-hover:text-brand-pink-dark sm:text-3xl">
                    ¿Tienes dudas sobre tu envío?
                  </span>
                  <span className="mt-1 block text-brand-ink/70">Escríbenos por WhatsApp y te ayudamos.</span>
                </span>
              </a>

              <ul className="grid grid-cols-3 gap-2 lg:border-x lg:border-brand-pink/30 lg:px-6">
                {REASSURANCE.map(({ icon: Icon, title, note }) => (
                  <li key={title} className="flex flex-col items-center text-center">
                    <Icon size={26} strokeWidth={1.6} className="text-brand-pink-dark" />
                    <span className="mt-1.5 text-sm font-semibold leading-tight text-brand-ink">{title}</span>
                    {note && <span className="text-xs text-brand-ink/60">{note}</span>}
                  </li>
                ))}
              </ul>

              <p className="text-center font-script text-2xl leading-snug text-brand-ink/80 lg:text-right">
                ¡Gracias por ser parte de Mia Store!
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-16 max-w-3xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-center font-script text-4xl font-bold text-brand-ink sm:text-5xl">¿Cómo comprar?</h2>
        </Reveal>
        <ol className="mt-8 space-y-4">
          {STEPS.map((s, i) => (
            <Reveal key={s} delay={i * 0.06}>
              <li className="card flex items-center gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink to-brand-lilac font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-brand-ink">{s}</span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
