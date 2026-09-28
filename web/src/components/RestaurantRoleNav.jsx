import RestaurantTaskDock from "./RestaurantTaskDock.jsx";
import { dakinisWriteRestaurantTask } from "../utils/restaurantTaskStorage.js";

const ROLE_TO_TASK = {
  camarero: "sala",
  cocina: "cocina",
  admin: "config"
};

const TASK_TO_ROLE = {
  sala: "camarero",
  cocina: "cocina",
  inventario: "admin",
  delivery: "admin",
  caja: "admin",
  config: "admin"
};

/**
 * Compatibilidad mockups: mapea roles legacy → dock de tareas.
 * @deprecated Preferir RestaurantTaskDock en pantallas operativas.
 */
export default function RestaurantRoleNav({ role, onRoleChange }) {
  const task = ROLE_TO_TASK[role] || "sala";

  return (
    <RestaurantTaskDock
      task={task}
      onTaskChange={(nextTask) => {
        dakinisWriteRestaurantTask(nextTask);
        onRoleChange?.(TASK_TO_ROLE[nextTask] || "camarero");
      }}
    />
  );
}
