import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

function Hero({ onNavigate }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["organized", "connected", "efficient", "collaborative", "smart"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 py-20 lg:py-32 items-center justify-center flex-col">
          <span className="text-brand-teal font-semibold text-sm uppercase tracking-wider">
            Welcome to UniShareSync
          </span>
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl md:text-6xl max-w-3xl tracking-tight text-center font-bold text-gray-900">
              Make your campus life
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 h-16 md:h-20">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-brand-teal"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-center text-gray-600">
              UniShareSync connects students, faculty, and campus activities—notes, projects, events, and schedules—all in one secure place.
            </p>
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <button 
              onClick={() => onNavigate && onNavigate('signup')}
              className="bg-brand-teal text-white px-8 py-3.5 rounded-lg font-semibold shadow-lg hover:bg-teal-600 hover:shadow-xl transition-all flex items-center gap-3"
            >
              Get Started <MoveRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('login')}
              className="bg-white text-gray-700 px-8 py-3.5 rounded-lg font-semibold border-2 border-gray-200 hover:border-brand-teal hover:text-brand-teal transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
