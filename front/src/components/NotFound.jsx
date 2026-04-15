import React from "react";
import { Bus, Wrench, Cloud } from "lucide-react";
import { motion } from "framer-motion";

class NotFound extends React.Component {
    render() {
        return (
            <div className="not-found">
                <div className="scene">
                    <motion.div
                        className="bus-wrapper"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            className="bus"
                            animate={{ rotate: [0, -2, 2, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Bus size={180} strokeWidth={1.5} />
                        </motion.div>

                        {/* Smoke */}
                        <motion.div
                            className="smoke smoke-1"
                            animate={{ y: [-5, -25], opacity: [0.6, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Cloud size={40} />
                        </motion.div>

                        <motion.div
                            className="smoke smoke-2"
                            animate={{ y: [-10, -35], opacity: [0.5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        >
                            <Cloud size={28} />
                        </motion.div>

                        {/* Wrench */}
                        <motion.div
                            className="wrench"
                            animate={{ rotate: [0, 25, -20, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Wrench size={60} strokeWidth={2} />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        );
    }
}

export default NotFound;