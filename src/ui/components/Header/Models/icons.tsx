export const Separator = ({ title = '' }) => (
    <div role="separator" className="mx-12 my-1 flex items-center justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/60 to-[#ffaa00]/60"></div>
        {title}
        <div className="flex-1 h-px bg-gradient-to-r from-[#55ff7f]/60 to-pink-500/60"></div>
    </div>
)

export const CodeIcon = () => (
    <svg fill="currentColor" fillRule="evenodd" className="h-5 w-5" style={{ flex: '0 0 auto; line-height: 1' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M392.8 65.2C375.8 60.3 358.1 70.2 353.2 87.2L225.2 535.2C220.3 552.2 230.2 569.9 247.2 574.8C264.2 579.7 281.9 569.8 286.8 552.8L414.8 104.8C419.7 87.8 409.8 70.1 392.8 65.2zM457.4 201.3C444.9 213.8 444.9 234.1 457.4 246.6L530.8 320L457.4 393.4C444.9 405.9 444.9 426.2 457.4 438.7C469.9 451.2 490.2 451.2 502.7 438.7L598.7 342.7C611.2 330.2 611.2 309.9 598.7 297.4L502.7 201.4C490.2 188.9 469.9 188.9 457.4 201.4zM182.7 201.3C170.2 188.8 149.9 188.8 137.4 201.3L41.4 297.3C28.9 309.8 28.9 330.1 41.4 342.6L137.4 438.6C149.9 451.1 170.2 451.1 182.7 438.6C195.2 426.1 195.2 405.8 182.7 393.3L109.3 320L182.6 246.6C195.1 234.1 195.1 213.8 182.6 201.3z" /></svg>
);


export const MistralIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 129 91" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', 'strokeMiterlimit': 2 }}>
        <g><rect x="18.292" y="0" width="18.293" height="18.123" style={{ fill: '#ffd800', fillRule: 'nonzero' }} /><rect x="91.473" y="0" width="18.293" height="18.123" style={{ fill: '#ffd800', fillRule: 'nonzero' }} /><rect x="18.292" y="18.121" width="36.586" height="18.123" style={{ fill: '#ffaf00', fillRule: 'nonzero', }} /><rect x="73.181" y="18.121" width="36.586" height="18.123" style={{ fill: '#ffaf00', fillRule: 'nonzero' }} /><rect x="18.292" y="36.243" width="91.476" height="18.122" style={{ fill: '#ff8205', fillRule: 'nonzero' }} /><rect x="18.292" y="54.37" width="18.293" height="18.123" style={{ fill: '#fa500f', fillRule: 'nonzero' }} /><rect x="54.883" y="54.37" width="18.293" height="18.123" style={{ fill: '#fa500f', fillRule: 'nonzero' }} /><rect x="91.473" y="54.37" width="18.293" height="18.123" style={{ fill: '#fa500f', fillRule: 'nonzero' }} /><rect x="0" y="72.504" width="54.89" height="18.123" style={{ fill: '#e10500', fillRule: 'nonzero' }} /><rect x="73.181" y="72.504" width="54.89" height="18.123" style={{ fill: '#e10500', fillRule: 'nonzero' }} /></g>
    </svg>
);
