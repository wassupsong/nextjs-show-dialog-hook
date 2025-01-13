import React, {
  ComponentProps,
  ComponentType,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { v4 as uuidv4 } from "uuid";

type DialogItem<P = any> = {
  id: string;
  Component: ComponentType<P>;
  props: P;
};

type DialogContextType = {
  dialogs: DialogItem[];
  showDialog: <T extends ComponentType<any>>(
    Component: T,
    props?: Omit<ComponentProps<T>, "open" | "onClose">
  ) => void;
  closeDialog: (id: string) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogs, setDialogs] = useState<DialogItem[]>([]);

  useEffect(() => {
    const handlePopState = () => {
      setDialogs([]);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const showDialog = useCallback(
    <T extends ComponentType<any>>(
      Component: T,
      props: Omit<ComponentProps<T>, "open" | "onClose"> = {} as Omit<
        ComponentProps<T>,
        "open" | "onClose"
      >
    ) => {
      const id = uuidv4(); // 고유 ID 생성
      setDialogs((prev) => [
        ...prev,
        { id, Component, props: { ...props, open: true } },
      ]);
    },
    [dialogs]
  );

  const closeDialog = useCallback(
    (id: string) => {
      setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
    },
    [dialogs]
  );

  return (
    <DialogContext.Provider value={{ dialogs, showDialog, closeDialog }}>
      {children}
      {dialogs.map(({ id, Component, props }) => (
        <Component key={id} {...props} onClose={() => closeDialog(id)} />
      ))}
    </DialogContext.Provider>
  );
};

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return context;
};

export { DialogProvider, useDialog };
