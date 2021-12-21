import React from "react";

export const HttpCodes = {
  OK: 200,
  BadRequest: 400,
};

export function useMountEffect(effect: React.EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);
}

export function useTimerEffect(callback: () => void, intervalMilliseconds: number) {
  useMountEffect(() => {
    let timer = setInterval(callback, intervalMilliseconds);
    return () => clearInterval(timer);
  });
}
