import { redirect } from "next/navigation";

// La página principal lleva a la app. Si no iniciaste sesión, la app te manda al login.
export default function Inicio() {
  redirect("/app");
}