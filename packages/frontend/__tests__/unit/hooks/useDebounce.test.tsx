import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "src/hooks/useDebounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useDebounce hook", () => {
  describe("When debouncing values", () => {
    it("returns initial value immediately", () => {
      const { result } = renderHook(() => useDebounce("test", 500));
      expect(result.current).toBe("test");
    });

    it("delays value update by specified delay", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 500 } },
      );

      expect(result.current).toBe("initial");

      rerender({ value: "updated", delay: 500 });
      expect(result.current).toBe("initial"); // Should not update yet

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current).toBe("updated");
    });

    it("only updates after delay period of inactivity", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "value1", delay: 500 } },
      );

      rerender({ value: "value2", delay: 500 });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("value1");

      rerender({ value: "value3", delay: 500 });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("value1");

      act(() => {
        vi.advanceTimersByTime(300); // Total now 500ms from last change
      });
      expect(result.current).toBe("value3");
    });

    it("preserves string value type", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "hello", delay: 300 } },
      );

      rerender({ value: "world", delay: 300 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(typeof result.current).toBe("string");
      expect(result.current).toBe("world");
    });

    it("preserves number value type", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 100, delay: 300 } },
      );

      rerender({ value: 200, delay: 300 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(typeof result.current).toBe("number");
      expect(result.current).toBe(200);
    });

    it("preserves object value type", () => {
      const obj1 = { name: "test1" };
      const obj2 = { name: "test2" };

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: obj1, delay: 300 } },
      );

      rerender({ value: obj2, delay: 300 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(typeof result.current).toBe("object");
      expect(result.current).toEqual(obj2);
    });
  });

  describe("When handling multiple rapid updates", () => {
    it("cancels previous debounce when value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "first", delay: 500 } },
      );

      rerender({ value: "second", delay: 500 });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      rerender({ value: "third", delay: 500 });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe("first"); // Still first, not second

      act(() => {
        vi.advanceTimersByTime(200); // Now 500ms from last change
      });
      expect(result.current).toBe("third");
    });

    it("cleans up timer on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { result, rerender, unmount } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "test", delay: 500 } },
      );

      rerender({ value: "updated", delay: 500 });
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});
