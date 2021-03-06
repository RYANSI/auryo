import * as React from 'react';
const autolinker = require('autolinker');

interface Props {
    text: string;
}

const Linkify = React.memo<Props>(({ text }) => {
    if (!text || (text && !text.length)) return null;

    let tag = null;
    let a = null;

    return (
        <div
            dangerouslySetInnerHTML={{
                __html: autolinker.link(text.replace(/\n/g, '</br>'), {
                    mention: 'soundcloud',
                    replaceFn: (match: any) => {
                        switch (match.getType()) {
                            case 'url':
                                if (/https?:\/\/(www.)?soundcloud\.com\//g.exec(match.getUrl()) !== null) {

                                    tag = match.buildTag();
                                    tag.setAttr('target', '_self');

                                    return tag;
                                }

                                return true;

                            case 'mention':
                                tag = match.buildTag();
                                tag.setAttr('href', `https://soundcloud.com/${match.getMention()}`);
                                tag.setAttr('target', '_self');

                                return tag;

                            case 'email':
                                a = match.buildTag();

                                a.setAttr('target', '_self');

                                return a;
                            default:
                                return false;

                        }
                    }
                })
            }}
        />
    );
});

export default Linkify;
