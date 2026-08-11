import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";

export default async function PrivacyPolicyPage() {
  const locale = await getServerLocale();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm sm:p-10 dark:bg-zinc-900">
        <Link
          href="/login"
          className="mb-6 inline-block text-xs font-semibold text-teal-600 hover:underline"
        >
          {locale === "fr" ? "← Retour à la connexion" : "← Back to login"}
        </Link>

        {locale === "fr" ? <FrenchPolicy /> : <EnglishPolicy />}
      </div>
    </div>
  );
}

function EnglishPolicy() {
  return (
    <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Privacy Policy</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Last updated: August 2026 · Applies to the ClinicBoard staff onboarding portal, operated
          by Clinique Physioversal.
        </p>
      </div>

      <Section title="1. Who this applies to">
        This policy covers the personal information of staff (employees and new hires) who use the
        ClinicBoard onboarding portal. It does not cover patient health records, which are handled
        under separate clinical privacy obligations.
      </Section>

      <Section title="2. Person in charge of protecting your information">
        Under Quebec’s Act respecting the protection of personal information in the private sector
        (Law 25), Clinique Physioversal has designated a person responsible for the protection of
        personal information collected through this portal. Privacy questions, access requests, or
        complaints can be directed to:{" "}
        <span className="font-semibold">[insert designated privacy contact name and email]</span>.
      </Section>

      <Section title="3. What information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Contact details: name, personal email, phone number, home address</li>
          <li>Employment details: job title, work location, start date, trainer assignment</li>
          <li>
            Government identifiers: Social Insurance Number, health card number, work permit number
            (where applicable) — encrypted, see Section 5
          </li>
          <li>Documents you upload: void cheque, identification, and similar onboarding paperwork</li>
          <li>
            Portal activity: goals/tasks completed, training materials viewed, messages sent within
            the portal, and AI check-in conversation transcripts
          </li>
        </ul>
      </Section>

      <Section title="4. Why we collect it, and who sees it">
        This information is used solely to manage your onboarding — setting up payroll and access,
        assigning training, and tracking your progress. HR staff can see your full record. You can
        see your own record. Other employees can only see what you choose to share through peer
        messaging.
      </Section>

      <Section title="5. How we protect it">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Your Social Insurance Number, health card number, and work permit number are encrypted
            before being stored — not stored as plain, readable text.
          </li>
          <li>Passwords are never stored in readable form.</li>
          <li>Access to HR-only pages and actions is restricted and independently verified server-side.</li>
          <li>All connections to the portal are encrypted (HTTPS).</li>
          <li>
            An internal audit log records when HR staff view or edit sensitive information, for
            accountability.
          </li>
          <li>Sessions automatically sign out after a period of inactivity.</li>
        </ul>
      </Section>

      <Section title="6. Third parties involved in providing this service">
        Some features rely on external service providers, who process data strictly to provide
        their service and not for their own purposes:
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Anthropic</span> (Claude) — powers the AI chat
            assistant and AI voice check-in conversations
          </li>
          <li>
            <span className="font-semibold">OpenAI</span> — converts AI responses to speech for the
            voice tour and voice check-ins
          </li>
          <li>
            <span className="font-semibold">Resend</span> — sends invite, password-reset, and
            reminder emails
          </li>
          <li>
            <span className="font-semibold">Vercel</span> and{" "}
            <span className="font-semibold">Supabase</span> — host the application and database
          </li>
        </ul>
      </Section>

      <Section title="7. How long we keep it">
        Information is kept for as long as needed to manage your employment and onboarding. When an
        employee record is marked inactive, the data is retained for historical record-keeping
        rather than deleted immediately; retained data is not used for any active purpose.
      </Section>

      <Section title="8. Your rights">
        You can review and update your own personal information directly in the portal. You may
        also request access to, correction of, or deletion of your information by contacting the
        privacy contact listed in Section 2.
      </Section>

      <Section title="9. In case of a data breach">
        If a security incident poses a real risk of harm, affected individuals and Quebec’s
        privacy regulator (the Commission d’accès à l’information) will be notified as required by
        law.
      </Section>
    </div>
  );
}

function FrenchPolicy() {
  return (
    <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50">
          Politique de confidentialité
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Dernière mise à jour : août 2026 · S’applique au portail d’intégration du personnel
          ClinicBoard, exploité par la Clinique Physioversal.
        </p>
      </div>

      <Section title="1. À qui s’applique cette politique">
        Cette politique couvre les renseignements personnels du personnel (employés et nouveaux
        employés) qui utilisent le portail d’intégration ClinicBoard. Elle ne couvre pas les
        dossiers médicaux des patients, qui relèvent d’obligations de confidentialité clinique
        distinctes.
      </Section>

      <Section title="2. Personne responsable de la protection de vos renseignements">
        En vertu de la Loi sur la protection des renseignements personnels dans le secteur privé
        du Québec (Loi 25), la Clinique Physioversal a désigné une personne responsable de la
        protection des renseignements personnels recueillis via ce portail. Les questions,
        demandes d’accès ou plaintes peuvent être adressées à :{" "}
        <span className="font-semibold">
          [insérer le nom et le courriel de la personne responsable]
        </span>
        .
      </Section>

      <Section title="3. Quels renseignements nous recueillons">
        <ul className="list-disc space-y-1 pl-5">
          <li>Coordonnées : nom, courriel personnel, numéro de téléphone, adresse domiciliaire</li>
          <li>
            Renseignements d’emploi : titre de poste, emplacement, date de début, formateur assigné
          </li>
          <li>
            Identifiants gouvernementaux : numéro d’assurance sociale, numéro de carte d’assurance
            maladie, numéro de permis de travail (le cas échéant) — chiffrés, voir la section 5
          </li>
          <li>
            Documents téléversés : chèque spécimen, pièce d’identité et documents d’intégration
            similaires
          </li>
          <li>
            Activité sur le portail : objectifs/tâches complétés, matériel de formation consulté,
            messages envoyés sur le portail, et transcriptions des suivis vocaux IA
          </li>
        </ul>
      </Section>

      <Section title="4. Pourquoi nous les recueillons, et qui y a accès">
        Ces renseignements servent uniquement à gérer votre intégration — mise en place de la paie
        et des accès, attribution de la formation, et suivi de votre progression. Le personnel des
        RH peut voir votre dossier complet. Vous pouvez voir votre propre dossier. Les autres
        employés ne voient que ce que vous choisissez de partager par messagerie entre collègues.
      </Section>

      <Section title="5. Comment nous les protégeons">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Votre numéro d’assurance sociale, votre numéro de carte d’assurance maladie et votre
            numéro de permis de travail sont chiffrés avant d’être stockés — jamais en texte brut
            lisible.
          </li>
          <li>Les mots de passe ne sont jamais stockés sous une forme lisible.</li>
          <li>
            L’accès aux pages et actions réservées aux RH est restreint et vérifié indépendamment
            côté serveur.
          </li>
          <li>Toutes les connexions au portail sont chiffrées (HTTPS).</li>
          <li>
            Un journal d’audit interne enregistre les consultations et modifications de
            renseignements sensibles par le personnel des RH, à des fins de responsabilisation.
          </li>
          <li>Les sessions se déconnectent automatiquement après une période d’inactivité.</li>
        </ul>
      </Section>

      <Section title="6. Tiers impliqués dans la prestation de ce service">
        Certaines fonctionnalités reposent sur des fournisseurs de services externes, qui traitent
        les données strictement pour fournir leur service, et non à leurs propres fins :
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Anthropic</span> (Claude) — alimente l’assistant de
            clavardage IA et les suivis vocaux IA
          </li>
          <li>
            <span className="font-semibold">OpenAI</span> — convertit les réponses de l’IA en
            parole pour la visite vocale et les suivis vocaux
          </li>
          <li>
            <span className="font-semibold">Resend</span> — envoie les courriels d’invitation, de
            réinitialisation de mot de passe et de rappel
          </li>
          <li>
            <span className="font-semibold">Vercel</span> et{" "}
            <span className="font-semibold">Supabase</span> — hébergent l’application et la base
            de données
          </li>
        </ul>
      </Section>

      <Section title="7. Combien de temps nous les conservons">
        Les renseignements sont conservés aussi longtemps que nécessaire pour gérer votre emploi
        et votre intégration. Lorsqu’un dossier d’employé est marqué inactif, les données sont
        conservées à des fins d’historique plutôt que supprimées immédiatement; les données
        conservées ne sont utilisées à aucune fin active.
      </Section>

      <Section title="8. Vos droits">
        Vous pouvez consulter et mettre à jour vos propres renseignements personnels directement
        dans le portail. Vous pouvez également demander l’accès, la correction ou la suppression
        de vos renseignements en contactant la personne responsable indiquée à la section 2.
      </Section>

      <Section title="9. En cas d’incident de confidentialité">
        Si un incident de sécurité présente un risque réel de préjudice, les personnes concernées
        et la Commission d’accès à l’information du Québec en seront informées, tel que requis par
        la loi.
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-sm font-bold text-slate-900 dark:text-zinc-50">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
