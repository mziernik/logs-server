import {  ReactDOM} from "../../core"
import {Component, Spinner} from "../../components"


export default class Busy extends Component {

    static propTypes = {
        size: PropTypes.any,
        fit: PropTypes.bool,
        label: PropTypes.string
    };

    spinner: Spinner;
    pre: HTMLDivElement;


    render() {
        const fit = this.props.fit;

        return <div
            className={fit ? "pre-spinner" : null}
            style={{
                display: "inline-block"
            }}
            ref={div => (this.pre = div) && setTimeout(() => div.style.opacity = 1, 100)}
        >

            <div
                className="spinner"
                style={{
                    width: "50px",
                    height: "50px"
                }}
                ref={div => {
                    if (!div) return;
                    div.setAttribute("dark", true);
                    for (let i = 0; i < 12; i++)
                        div.appendChild(document.createElement("div"));
                }}
            />
            <div style={{
                display: fit ? "block" : "inline-block",
                marginLeft: fit ? 0 : "20px",
                marginTop: fit ? "20px" : 0
            }}>{this.props.label}</div>
        </div>
    }

}