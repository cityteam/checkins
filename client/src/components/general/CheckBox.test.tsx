import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CheckBox from "./CheckBox";

test("renders correctly with maximal properties", () => {

    const LABEL = "My Label";
    const NAME = "myCheckbox";
    const handleChange = jest.fn();

    render(<CheckBox
        autoFocus
        disabled
        handleChange={handleChange}
        label={LABEL}
        name={NAME}
        value={true}
    />);

    const inputElement = screen.getByLabelText(LABEL);
    expect(inputElement).toBeInTheDocument();
    // NOTE - console.log("inputElement", prettyDOM(inputElement));
    // NOTE - autoFocus is a Javascript thing
    expect(inputElement).toBeChecked();
    expect(inputElement).toBeDisabled();
    expect(inputElement).toHaveAttribute("id", NAME);
    expect(inputElement).toHaveAttribute("type", "checkbox");

    // Cannot click on a disabled element, so do not check for that

});

test("renders correctly with minimal properties", () => {

    const LABEL_TEXT = "My Label";
    const handleChange = jest.fn();
    render(<CheckBox
        handleChange={handleChange}
        label={LABEL_TEXT}
    />);

    const inputElement = screen.getByLabelText(LABEL_TEXT);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).not.toBeChecked();
    expect(inputElement).toBeEnabled();
    expect(inputElement).toHaveAttribute("id", "checkBox"); // Default value
    expect(inputElement).toHaveAttribute("type", "checkbox");

    userEvent.click(inputElement);
    expect(inputElement).toBeChecked();
    userEvent.click(inputElement);
    expect(inputElement).not.toBeChecked();

});
