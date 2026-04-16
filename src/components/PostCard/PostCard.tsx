import { format } from 'date-fns';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import styles from './PostCard.module.css';

export interface PostCardProps {
    title: string;
    date: string;
    description: string;
    slug: string;
}

export const PostCard = ({ title, date, description, slug }: PostCardProps) => {
    return (
        <Link className={styles.card} href={`/updates/${slug}`}>
            <div className={styles.content}>
                <time className={styles.date} dateTime={date}>
                    {format(new Date(date), 'MMMM d, yyyy')}
                </time>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </div>
            <span className={styles.arrow}>
                <FiArrowRight />
            </span>
        </Link>
    );
};
