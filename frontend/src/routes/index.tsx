import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "@/features/landing/LandingPage";
import AuthPage from "@/features/auth/AuthPage";
import OnboardingPage from "@/features/onboarding/OnboardingPage";
import GardenPage from "@/features/garden/GardenPage";
import PlanningPage from "@/features/planning/PlanningPage";
import TeacherPage from "@/features/teacher/TeacherPage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />
  },
  {
    path: "/garden",
    element: (
      <ProtectedRoute>
        <GardenPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/planning",
    element: (
      <ProtectedRoute>
        <PlanningPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/teacher",
    element: (
      <ProtectedRoute allowedRoles={["teacher", "admin"]}>
        <TeacherPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/quiz",
    element: <Navigate to="/garden" replace />
  },
  {
    path: "/quizz",
    element: <Navigate to="/garden" replace />
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
