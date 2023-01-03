export default function TextField({ placeholder, ...props }) {
    return (
        <div class="text-field-container">
            <input class="text-field-input" type="text" placeholder={placeholder} {...props} />
            <span class="focus-border" />
        </div>
    )
}