import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DialogProvider, useDialog } from "./index";
import "@testing-library/jest-dom";

// Mock test components
const TestDialog = ({
  open,
  onClose,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
}) =>
  open ? (
    <div data-testid="test-dialog" onClick={onClose}>
      {title}
    </div>
  ) : null;

const TestNestedComponent = () => {
  const { showDialog, closeDialog } = useDialog();
  return (
    <button onClick={() => showDialog(TestDialog, { title: "Test Dialog" })}>
      Open Dialog
    </button>
  );
};

describe("DialogProvider", () => {
  beforeEach(() => {
    // Clear any lingering dialogs
    document.body.innerHTML = "";
  });

  test("renders children correctly", () => {
    render(
      <DialogProvider>
        <div data-testid="child">Child Content</div>
      </DialogProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("shows dialog when showDialog is called", () => {
    render(
      <DialogProvider>
        <TestNestedComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("test-dialog")).toBeInTheDocument();
  });

  test("closes dialog when closeDialog is triggered", () => {
    render(
      <DialogProvider>
        <TestNestedComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("test-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("test-dialog"));
    expect(screen.queryByTestId("test-dialog")).not.toBeInTheDocument();
  });

  test("handles multiple dialogs correctly", () => {
    const MultipleDialogsTest = () => {
      const { showDialog } = useDialog();
      return (
        <>
          <button onClick={() => showDialog(TestDialog, { title: "Dialog 1" })}>
            Open 1
          </button>
          <button onClick={() => showDialog(TestDialog, { title: "Dialog 2" })}>
            Open 2
          </button>
        </>
      );
    };

    render(
      <DialogProvider>
        <MultipleDialogsTest />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Open 1"));
    fireEvent.click(screen.getByText("Open 2"));
    expect(screen.getAllByTestId("test-dialog")).toHaveLength(2);
  });

  test("clears all dialogs on popstate event", () => {
    render(
      <DialogProvider>
        <TestNestedComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("test-dialog")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.queryByTestId("test-dialog")).not.toBeInTheDocument();
  });

  test("useDialog hook throws error outside provider", () => {
    const consoleError = console.error;
    console.error = jest.fn(); // Suppress console.error for this test

    expect(() => {
      render(<TestNestedComponent />);
    }).toThrow("useDialog must be used within DialogProvider");

    console.error = consoleError; // Restore console.error
  });
});
