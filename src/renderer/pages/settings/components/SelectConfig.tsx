import * as React from 'react';
import { ConfigState, setConfigKey } from '@common/store/config';

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    configKey: string;
    name: string;
    data: Array<{ k: string, v: any }>;
    className?: string;
    onChange?: (value: string) => void;
    usePlaceholder: boolean;
}

class SelectConfig extends React.PureComponent<Props> {

    static readonly defaultProps: Partial<Props> = {
        usePlaceholder: false,
        className: '',
        data: []
    };

    handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
        const { configKey, setConfigKey, onChange } = this.props;

        setConfigKey(configKey, e.currentTarget.value);

        if (onChange) {
            onChange(e.currentTarget.value);
        }
    }


    render() {
        const { configKey, name, config, className, usePlaceholder, data } = this.props;

        const value = configKey.split('.').reduce((o, i) => o[i], config);

        return (
            <div className={`setting d-flex justify-content-between align-items-center ${className}`}>
                {
                    !usePlaceholder && <span>{name}</span>}
                <select
                    className='form-control form-control-sm'
                    onChange={this.handleChange}
                    defaultValue={value || ''}
                >
                    {
                        data.map(({ k, v }) => (
                            <option value={v} key={k}>{k}</option>
                        ))}
                </select>
            </div>
        );
    }

}

export default SelectConfig;
