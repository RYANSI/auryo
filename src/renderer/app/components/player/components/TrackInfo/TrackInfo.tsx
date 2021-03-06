import * as React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './TrackInfo.module.scss';
import FallbackImage from '../../../../../_shared/FallbackImage';
import TextShortener from '../../../../../_shared/TextShortener';
import * as cn from 'classnames';

interface Props {
    img: string;
    title: string;
    id: string;
    userId: string;
    username: string;

    liked: boolean;
    toggleLike: () => void;
}

const TrackInfo = React.memo<Props>(({ img, title, id, userId, username, liked, toggleLike }) => (
    <div className={styles.trackInfo}>
        <div className={styles.playerAlbum}>
            <a
                className={cn(styles.trackLike, { [styles.trackLike__liked]: liked })}
                href='javascript:void(0)'
                onClick={toggleLike}
            >
                <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'}`} />
            </a>
            <FallbackImage
                noPlaceholder={true}
                className='img-fluid'
                src={img}
            />
        </div>
        <div className={styles.trackDetails}>
            <Link className={styles.trackTitle} to={`/track/${id}`}>
                <TextShortener text={title} />
            </Link>
            <Link className={styles.trackArtist} to={`/user/${userId}`}>
                <TextShortener text={username} />
            </Link>
        </div>
    </div>
));

export default TrackInfo;
