import "server-only";
import type { Employee } from "@prisma/client";
import { titleLabel, locationLabel } from "@/lib/labels";
import type { Locale } from "@/lib/i18n/translations";

export type TourStep = {
  id: string;
  icon: string;
  title: string;
  narration: string;
  href: string;
};

export function buildTourSteps(employee: Employee, locale: Locale): TourStep[] {
  const firstName = employee.fullName.split(" ")[0];
  const role = titleLabel(employee.title, locale);
  const location = locationLabel(employee.location, locale);
  const trainer = employee.trainerName;

  if (locale === "fr") {
    return [
      {
        id: "welcome",
        icon: "👋",
        title: "Bienvenue",
        narration: `Salut ${firstName}, bienvenue chez ClinicBoard! Je suis ton guide vocal, et je vais te faire visiter ton portail d'intégration étape par étape. Ça ne prendra que quelques minutes. C'est parti!`,
        href: "/employee",
      },
      {
        id: "home",
        icon: "🏠",
        title: "Ton tableau de bord",
        narration: `Ceci est ta page d'accueil. En haut, tu vois ta progression globale — ça se remplit au fur et à mesure que tu avances. À côté, tes infos rapides: qui est ton formateur${
          trainer ? `, ${trainer}` : ""
        }, ton courriel de travail, et ton emplacement, ${location}. Plus bas, tes tâches du jour — coche-les au fur et à mesure. Vérifie ça.`,
        href: "/employee",
      },
      {
        id: "training",
        icon: "📚",
        title: "Matériel de formation",
        narration: `Ensuite, le matériel de formation. C'est là que les RH déposent les guides et documents dont tu as besoin pour ton poste de ${role}. Prends le temps de tout lire — c'est vraiment important pour bien démarrer. Vérifie ça.`,
        href: "/employee/training",
      },
      {
        id: "access",
        icon: "🔑",
        title: "Infos d'accès",
        narration: `Cette section contient tes accès pour ton emplacement, comme les codes de porte, le mot de passe Wi-Fi, et tes identifiants pour MEDEXA et Myle. Garde ces infos confidentielles. Vérifie ça.`,
        href: "/employee/access",
      },
      {
        id: "documents",
        icon: "📋",
        title: "Mes documents",
        narration: `Ici, tu peux téléverser tes documents personnels — comme un chèque spécimen ou une preuve d'identité — que les RH t'ont demandés. Vérifie ça.`,
        href: "/employee/documents",
      },
      {
        id: "schedule",
        icon: "🗓️",
        title: "Mon horaire",
        narration: `Ta grille horaire d'intégration est ici — les RH y ajoutent tes rencontres et sessions de formation à venir. Vérifie ça.`,
        href: "/employee/schedule",
      },
      {
        id: "messages",
        icon: "💬",
        title: "Messages",
        narration: `Besoin de parler aux RH ou à un collègue qui s'intègre en même temps que toi? C'est ici. Vérifie ça.`,
        href: "/employee/messages",
      },
      {
        id: "done",
        icon: "🎉",
        title: "C'est tout!",
        narration: `Et voilà, tu as fait le tour au complet! Si tu as d'autres questions en cours de route, le bouton de clavardage IA en bas à droite est toujours là pour toi. Bonne intégration, ${firstName}!`,
        href: "/employee",
      },
    ];
  }

  return [
    {
      id: "welcome",
      icon: "👋",
      title: "Welcome",
      narration: `Hey ${firstName}, welcome to ClinicBoard! I'm your voice guide, and I'm going to walk you through your onboarding portal step by step. This'll only take a few minutes. Let's go!`,
      href: "/employee",
    },
    {
      id: "home",
      icon: "🏠",
      title: "Your Dashboard",
      narration: `This is your home page. Up top, you'll see your overall progress — it fills in as you go. Next to it, your quick info: who your trainer is${
        trainer ? `, ${trainer}` : ""
      }, your work email, and your location, ${location}. Below that, your tasks for today — check them off as you complete them. Check this.`,
      href: "/employee",
    },
    {
      id: "training",
      icon: "📚",
      title: "Training Materials",
      narration: `Next up, Training Materials. This is where HR uploads the guides and documents you need for your role as a ${role}. Take the time to go through all of it — it really matters for a strong start. Check this.`,
      href: "/employee/training",
    },
    {
      id: "access",
      icon: "🔑",
      title: "Access Info",
      narration: `This section holds your access details for your location — things like door codes, Wi-Fi passwords, and your MEDEXA and Myle logins. Keep this information confidential. Check this.`,
      href: "/employee/access",
    },
    {
      id: "documents",
      icon: "📋",
      title: "My Documents",
      narration: `Here's where you upload your personal documents — like a void cheque or ID — that HR has asked you for. Check this.`,
      href: "/employee/documents",
    },
    {
      id: "schedule",
      icon: "🗓️",
      title: "My Schedule",
      narration: `Your onboarding schedule lives here — HR adds your upcoming meetings and training sessions to it. Check this.`,
      href: "/employee/schedule",
    },
    {
      id: "messages",
      icon: "💬",
      title: "Messages",
      narration: `Need to reach HR, or a coworker who's onboarding at the same time as you? This is the place. Check this.`,
      href: "/employee/messages",
    },
    {
      id: "done",
      icon: "🎉",
      title: "That's a wrap!",
      narration: `And that's the full tour! If anything comes up along the way, the AI chat button in the bottom-right corner is always there for you. Welcome aboard, ${firstName}!`,
      href: "/employee",
    },
  ];
}
