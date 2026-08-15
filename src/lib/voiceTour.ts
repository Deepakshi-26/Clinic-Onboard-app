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
  /** Matches a Card's `tourId` / an element's `data-tour` to spotlight it. */
  target?: string;
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
        id: "home-welcome",
        icon: "🏠",
        title: "Ton tableau de bord",
        narration: `Ceci est ta page d'accueil. En haut, tu vois ta progression globale. Ça se remplit au fur et à mesure que tu avances.`,
        href: "/employee",
        target: "home-welcome",
      },
      {
        id: "home-quickinfo",
        icon: "📌",
        title: "Infos rapides",
        narration: `Ici, tes infos rapides: qui est ton formateur${
          trainer ? `, ${trainer}` : ""
        }, ton courriel de travail, et ton emplacement, ${location}.`,
        href: "/employee",
        target: "home-quickinfo",
      },
      {
        id: "home-tasks",
        icon: "✅",
        title: "Tâches du jour",
        narration: `Et là, tes tâches du jour. Coche-les au fur et à mesure que tu les termines. Tu es sur la bonne voie.`,
        href: "/employee",
        target: "home-tasks",
      },
      {
        id: "training",
        icon: "📚",
        title: "Matériel de formation",
        narration: `Ensuite, le matériel de formation. C'est là que les RH déposent les guides et documents dont tu as besoin pour ton poste de ${role}. Prends le temps de tout lire. Tu bâtis une belle base.`,
        href: "/employee/training",
        target: "training-list",
      },
      {
        id: "access-codes",
        icon: "🔑",
        title: "Codes d'accès",
        narration: `Cette section contient tes accès pour ton emplacement: ton code de porte, le mot de passe Wi-Fi, et le code de l'immeuble. Garde ces infos confidentielles.`,
        href: "/employee/access",
        target: "access-codes",
      },
      {
        id: "access-medexa",
        icon: "🔑",
        title: "Identifiants MEDEXA",
        narration: `Et ici, tes identifiants pour MEDEXA, le logiciel que tu utiliseras au quotidien.`,
        href: "/employee/access",
        target: "access-medexa",
      },
      {
        id: "access-myle",
        icon: "🔑",
        title: "Identifiants Myle",
        narration: `Et ici, tes identifiants Myle.`,
        href: "/employee/access",
        target: "access-myle",
      },
      {
        id: "access-extra",
        icon: "🔑",
        title: "Le reste",
        narration: `Et pour finir cette page: où récupérer ton équipement, qui contacter pour des demandes, le nom de ton formateur, et les infos de stationnement si ça s'applique à toi. Une chose de moins à te soucier.`,
        href: "/employee/access",
        target: "access-extra",
      },
      {
        id: "documents-info",
        icon: "📝",
        title: "Tes infos personnelles",
        narration: `D'abord, garde tes infos personnelles à jour ici: ton nom, ton téléphone, ta date de naissance et ton adresse sont tous modifiables au même endroit.`,
        href: "/employee/documents",
        target: "documents-info",
      },
      {
        id: "documents-upload",
        icon: "📋",
        title: "Mes documents",
        narration: `Ensuite, voici où téléverser les documents que les RH t'ont demandés, comme un chèque spécimen ou une preuve d'identité. Tu y es presque, bon travail.`,
        href: "/employee/documents",
        target: "documents-upload",
      },
      {
        id: "documents-uploads",
        icon: "📋",
        title: "Tes téléversements",
        narration: `Et tes fichiers déjà envoyés apparaissent juste ici, si jamais tu veux vérifier.`,
        href: "/employee/documents",
        target: "documents-uploads",
      },
      {
        id: "schedule",
        icon: "🗓️",
        title: "Mon horaire",
        narration: `Ta grille horaire d'intégration est ici. Les RH y ajoutent tes rencontres et sessions de formation à venir. Tout est déjà planifié pour toi.`,
        href: "/employee/schedule",
        target: "schedule-list",
      },
      {
        id: "messages-support",
        icon: "💬",
        title: "Parler aux RH",
        narration: `Besoin de parler aux RH? Tu peux leur écrire directement ici.`,
        href: "/employee/messages",
        target: "messages-support",
      },
      {
        id: "messages-peers",
        icon: "🤝",
        title: "Tes collègues",
        narration: `Et si d'autres personnes s'intègrent en même temps que toi, tu peux aussi leur écrire ici. Tu n'es jamais seul ici.`,
        href: "/employee/messages",
        target: "messages-peers",
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
      id: "home-welcome",
      icon: "🏠",
      title: "Your Dashboard",
      narration: `This is your home page. Up top, you'll see your overall progress. It fills in as you go.`,
      href: "/employee",
      target: "home-welcome",
    },
    {
      id: "home-quickinfo",
      icon: "📌",
      title: "Quick Info",
      narration: `Over here, your quick info: who your trainer is${
        trainer ? `, ${trainer}` : ""
      }, your work email, and your location, ${location}.`,
      href: "/employee",
      target: "home-quickinfo",
    },
    {
      id: "home-tasks",
      icon: "✅",
      title: "Today's Tasks",
      narration: `And below that, your tasks for today. Check them off as you complete them. You've got this.`,
      href: "/employee",
      target: "home-tasks",
    },
    {
      id: "training",
      icon: "📚",
      title: "Training Materials",
      narration: `Next up, Training Materials. This is where HR uploads the guides and documents you need for your role as a ${role}. Take the time to go through all of it. You're building a great foundation.`,
      href: "/employee/training",
      target: "training-list",
    },
    {
      id: "access-codes",
      icon: "🔑",
      title: "Access Codes",
      narration: `This section holds your access details for your location: your door code, Wi-Fi password, and building passcode. Keep this information confidential.`,
      href: "/employee/access",
      target: "access-codes",
    },
    {
      id: "access-medexa",
      icon: "🔑",
      title: "MEDEXA Login",
      narration: `And here's your MEDEXA login, the practice software you'll use day to day.`,
      href: "/employee/access",
      target: "access-medexa",
    },
    {
      id: "access-myle",
      icon: "🔑",
      title: "Myle Login",
      narration: `And here's your Myle login.`,
      href: "/employee/access",
      target: "access-myle",
    },
    {
      id: "access-extra",
      icon: "🔑",
      title: "A few more things",
      narration: `Rounding out this page: where to pick up your equipment, who to contact for requests, your trainer's name, and parking info if that applies to you. One less thing to worry about.`,
      href: "/employee/access",
      target: "access-extra",
    },
    {
      id: "documents-info",
      icon: "📝",
      title: "Your Personal Info",
      narration: `First up, keep your personal info current here: your name, phone, date of birth, and address are all editable in one place.`,
      href: "/employee/documents",
      target: "documents-info",
    },
    {
      id: "documents-upload",
      icon: "📋",
      title: "My Documents",
      narration: `Next, here's where you upload documents HR has asked you for, like a void cheque or ID. Almost there, nice work.`,
      href: "/employee/documents",
      target: "documents-upload",
    },
    {
      id: "documents-uploads",
      icon: "📋",
      title: "Your Uploads",
      narration: `And whatever you've already sent shows up right here, any time you want to check.`,
      href: "/employee/documents",
      target: "documents-uploads",
    },
    {
      id: "schedule",
      icon: "🗓️",
      title: "My Schedule",
      narration: `Your onboarding schedule lives here. HR adds your upcoming meetings and training sessions to it. Everything's mapped out for you.`,
      href: "/employee/schedule",
      target: "schedule-list",
    },
    {
      id: "messages-support",
      icon: "💬",
      title: "Message HR",
      narration: `Need to reach HR? You can message them directly, right here.`,
      href: "/employee/messages",
      target: "messages-support",
    },
    {
      id: "messages-peers",
      icon: "🤝",
      title: "Your Peers",
      narration: `And if other people are onboarding at the same time as you, you can message them here too. You're never on your own here.`,
      href: "/employee/messages",
      target: "messages-peers",
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
