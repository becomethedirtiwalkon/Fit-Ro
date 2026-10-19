import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  assignments,
  likes,
  messages,
  plans,
  posts,
  progress,
  users,
  type PlanData,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export const ADMIN_EMAIL = "rocio@roalcalafit.com";
export const ADMIN_PASSWORD = "rocio1234";
export const DEMO_EMAIL = "demo@roalcalafit.com";
export const DEMO_PASSWORD = "demo1234";

const IMG = {
  dumbbell:
    "https://images.pexels.com/photos/4854257/pexels-photo-4854257.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  machine:
    "https://images.pexels.com/photos/3931061/pexels-photo-3931061.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  kettlebell:
    "https://images.pexels.com/photos/38755281/pexels-photo-38755281.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  mat: "https://images.pexels.com/photos/7992050/pexels-photo-7992050.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  trainer:
    "https://images.pexels.com/photos/8436154/pexels-photo-8436154.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  curl: "https://images.pexels.com/photos/6455931/pexels-photo-6455931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

function routine(blocks: PlanData["blocks"]): PlanData {
  return { blocks };
}

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const existing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  if ((existing[0]?.count ?? 0) > 0) return;

  const [admin] = await db
    .insert(users)
    .values({
      name: "Rocío Alcalá",
      email: ADMIN_EMAIL,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role: "admin",
      goal: "Entrenar con propósito",
      bio: "Personal Trainer · Entrenamiento de fuerza, recomposición corporal y hábitos sostenibles.",
    })
    .returning();

  const [demo] = await db
    .insert(users)
    .values({
      name: "Martina Gómez",
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      role: "client",
      goal: "Tonificar y ganar fuerza",
      bio: "Entrenando 4 veces por semana 💪",
    })
    .returning();

  const createdPlans = await db
    .insert(plans)
    .values([
      {
        title: "Full Body Despertar",
        summary:
          "3 días por semana para activar todo el cuerpo, ideal para arrancar con base sólida.",
        kind: "rutina",
        level: "Inicial",
        weeks: 4,
        cover: IMG.dumbbell,
        isPublic: true,
        data: routine([
          {
            title: "Día 1 · Tren inferior",
            subtitle: "Fuerza + core",
            items: [
              { name: "Sentadilla goblet", sets: "4", reps: "12", notes: "Bajá controlando 3 seg." },
              { name: "Peso muerto rumano", sets: "4", reps: "10", notes: "Espalda neutra." },
              { name: "Zancadas alternadas", sets: "3", reps: "12 x pierna", notes: "" },
              { name: "Plancha abdominal", sets: "3", reps: "40 seg", notes: "Glúteos activos." },
            ],
          },
          {
            title: "Día 2 · Tren superior",
            subtitle: "Empuje + tracción",
            items: [
              { name: "Press banca con mancuernas", sets: "4", reps: "10", notes: "" },
              { name: "Remo a un brazo", sets: "4", reps: "12", notes: "Codo pegado al cuerpo." },
              { name: "Press militar sentada", sets: "3", reps: "10", notes: "" },
              { name: "Face pull", sets: "3", reps: "15", notes: "Para hombro sano." },
            ],
          },
          {
            title: "Día 3 · Full body",
            subtitle: "Circuito metabólico",
            items: [
              { name: "Hip thrust", sets: "4", reps: "12", notes: "Pausa 1 seg arriba." },
              { name: "Jalón al pecho", sets: "4", reps: "12", notes: "" },
              { name: "Swing con kettlebell", sets: "3", reps: "20", notes: "Cadera, no brazos." },
              { name: "Bicicleta abdominal", sets: "3", reps: "30 seg", notes: "" },
            ],
          },
        ]),
      },
      {
        title: "Glúteos & Piernas Pro",
        summary: "4 semanas de progresión con foco en cadena posterior y fuerza real.",
        kind: "rutina",
        level: "Intermedio",
        weeks: 4,
        cover: IMG.kettlebell,
        isPublic: true,
        data: routine([
          {
            title: "Bloque A · Fuerza",
            subtitle: "Pesado y controlado",
            items: [
              { name: "Sentadilla con barra", sets: "5", reps: "6", notes: "RPE 8." },
              { name: "Hip thrust con barra", sets: "4", reps: "8", notes: "" },
              { name: "Peso muerto sumo", sets: "4", reps: "8", notes: "" },
            ],
          },
          {
            title: "Bloque B · Accesorios",
            subtitle: "Volumen e hipertrofia",
            items: [
              { name: "Bulgarian split squat", sets: "4", reps: "10 x pierna", notes: "" },
              { name: "Patada de glúteo en polea", sets: "4", reps: "15", notes: "" },
              { name: "Abductores en máquina", sets: "3", reps: "20", notes: "Quemazón final." },
              { name: "Elevación de talones", sets: "4", reps: "15", notes: "" },
            ],
          },
        ]),
      },
      {
        title: "Plan nutricional 1800 kcal",
        summary: "Guía flexible de comidas con porciones simples y opciones de reemplazo.",
        kind: "dieta",
        level: "Recomposición",
        weeks: 4,
        cover: IMG.mat,
        isPublic: false,
        data: routine([
          {
            title: "Desayuno",
            subtitle: "≈ 450 kcal",
            items: [
              { name: "Avena con leche", sets: "60 g", reps: "320 kcal", notes: "Canela a gusto." },
              { name: "Claras revueltas", sets: "150 g", reps: "80 kcal", notes: "" },
              { name: "Frutos rojos", sets: "80 g", reps: "50 kcal", notes: "" },
            ],
          },
          {
            title: "Almuerzo",
            subtitle: "≈ 600 kcal",
            items: [
              { name: "Pechuga de pollo", sets: "180 g", reps: "300 kcal", notes: "Grillada." },
              { name: "Arroz integral", sets: "150 g cocido", reps: "190 kcal", notes: "" },
              { name: "Ensalada mixta", sets: "Libre", reps: "110 kcal", notes: "1 cda de oliva." },
            ],
          },
          {
            title: "Merienda + Cena",
            subtitle: "≈ 750 kcal",
            items: [
              { name: "Yogur proteico", sets: "200 g", reps: "150 kcal", notes: "" },
              { name: "Tostadas integrales", sets: "2 u", reps: "160 kcal", notes: "" },
              { name: "Salmón o carne magra", sets: "180 g", reps: "330 kcal", notes: "" },
              { name: "Verduras al horno", sets: "Libre", reps: "110 kcal", notes: "" },
            ],
          },
        ]),
      },
      {
        title: "Express 20 minutos",
        summary: "Para los días sin tiempo: alta intensidad, cero excusas.",
        kind: "rutina",
        level: "Todos los niveles",
        weeks: 2,
        cover: IMG.machine,
        isPublic: true,
        data: routine([
          {
            title: "Circuito único",
            subtitle: "4 vueltas · 45 seg trabajo / 15 seg pausa",
            items: [
              { name: "Burpees", sets: "4", reps: "45 seg", notes: "" },
              { name: "Sentadilla con salto", sets: "4", reps: "45 seg", notes: "" },
              { name: "Mountain climbers", sets: "4", reps: "45 seg", notes: "" },
              { name: "Plancha con toque de hombro", sets: "4", reps: "45 seg", notes: "" },
            ],
          },
        ]),
      },
    ])
    .returning();

  if (demo && createdPlans[0] && createdPlans[2]) {
    await db.insert(assignments).values([
      {
        planId: createdPlans[0].id,
        userId: demo.id,
        note: "Arrancá con esta semana 1 y me contás cómo te sentís 💪",
      },
      {
        planId: createdPlans[2].id,
        userId: demo.id,
        note: "Tu plan de comidas. Si algo no te gusta lo cambiamos por chat.",
      },
    ]);
  }

  const createdPosts = await db
    .insert(posts)
    .values([
      {
        authorId: admin.id,
        kind: "frase",
        body: "La disciplina es elegirte incluso los días en que no tenés ganas. Hoy también cuenta. ✨",
      },
      {
        authorId: admin.id,
        kind: "avance",
        body: "¡8 semanas de Martina! Constancia, buen descanso y progresión de cargas. Orgullo total 🔥",
        image: IMG.curl,
      },
      {
        authorId: admin.id,
        kind: "tip",
        body: "Tip de la semana: sumá 10 g de proteína a tu desayuno. Vas a llegar más saciada al almuerzo y vas a rendir mejor en el entrenamiento.",
      },
      {
        authorId: admin.id,
        kind: "foto",
        body: "Nuevo bloque de fuerza cargado en la app. Entrá a Rutinas y mirá el Full Body Despertar 💛",
        image: IMG.trainer,
      },
    ])
    .returning();

  if (demo && createdPosts[0] && createdPosts[1]) {
    await db.insert(likes).values([
      { postId: createdPosts[0].id, userId: demo.id },
      { postId: createdPosts[1].id, userId: demo.id },
    ]);
  }

  if (demo) {
    await db.insert(messages).values([
      {
        clientId: demo.id,
        senderId: admin.id,
        body: "¡Hola Martina! Ya te cargué la rutina nueva y el plan de comidas 🙌",
      },
      {
        clientId: demo.id,
        senderId: demo.id,
        body: "¡Gracias Ro! Una consulta: puedo cambiar el arroz por batata?",
      },
      {
        clientId: demo.id,
        senderId: admin.id,
        body: "Sí, 200 g de batata reemplazan los 150 g de arroz. Cualquier cosa me escribís por acá.",
      },
    ]);

    await db.insert(progress).values([
      { userId: demo.id, weight: "64.8", note: "Semana 1 · arranque" },
      { userId: demo.id, weight: "64.1", note: "Semana 3 · más energía" },
      { userId: demo.id, weight: "63.4", note: "Semana 6 · subí cargas" },
    ]);
  }
}

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      console.error("seed failed", error);
    });
  }
  await seedPromise;
}
