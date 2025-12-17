import { useInView } from "react-intersection-observer";
import { useState, useEffect, useMemo } from "react";
import _ from "lodash";

const VisibilityChecker = ({ onLoading, text }) => {
  const { ref, inView } = useInView({
    threshold: 1, // Percentuale di visibilità
  });

  const [triggering, setTriggering] = useState(false);
  const [prevState, setPrevState] = useState(true);

  const debouncedLoading = useMemo(() => {
    return _.debounce(() => {
      onLoading();
      setTriggering(false);
    }, 200);
  }, [onLoading]);

  useEffect(() => {
    if (triggering) debouncedLoading();
    return () => {
      debouncedLoading.cancel();
    };
  }, [debouncedLoading, triggering]);

  useEffect(() => {
    if (inView !== prevState) {
      setPrevState(inView);
      if (inView) {
        setTriggering(true);
      } else debouncedLoading.cancel();
    }
  }, [inView, debouncedLoading, prevState]);

  return (
    <div
      ref={ref}
      style={{
        left: "0px",
        marginBottom: "16px",
        position: "sticky",
        display: "inline-block",
      }}
    >
      {triggering && text ? text : <>&nbsp;</>}
    </div>
  );
};

export default VisibilityChecker;
