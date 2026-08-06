import { motion } from 'framer-motion';

function PageWrapper({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ width: '100%', minHeight: '100vh' }}
        >
            {children}
        </motion.div>
    );
}

export default PageWrapper;