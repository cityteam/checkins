import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchBar from "./SearchBar";
import {HandleValue} from "../../types";

test("renders correctly with disabled", () => {

    const LABEL = "Search Bar Label:";
    const handleChange = jest.fn();
    const handleValue = jest.fn();

    render(<SearchBar
        disabled
        handleChange={handleChange}
        handleValue={handleValue}
        label={LABEL}
        name="mySearchBar"
    />);

    const inputElement = screen.getByLabelText(LABEL);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute("disabled");

    userEvent.type(inputElement,"abc{enter}");
    expect(inputElement).toHaveValue(""); // Should not have typed anything

})

test("renders correctly with maximal properties (but not disabled)", () => {

    const HTML_SIZE=50;
    const LABEL = "My Label:";
    const NAME = "myName";
    const PLACEHOLDER="Enter search text here";
    const VALUE="value";

    let lastChange = "";
    const handleChange: HandleValue = (theChange) => {
        lastChange = theChange;
    }
    let lastValue = "";
    const handleValue: HandleValue = (theValue) => {
        lastValue = theValue;
    }

    render(<SearchBar
        autoFocus
        // disabled - cannot test input if this was set
        handleChange={handleChange}
        handleValue={handleValue}
        htmlSize={HTML_SIZE}
        label={LABEL}
        name={NAME}
        placeholder={PLACEHOLDER}
    />);

    const inputElement = screen.getByLabelText(LABEL);
    expect(inputElement).toBeInTheDocument();
    // NOTE - console.log("inputElement", prettyDOM(inputElement));
    // NOTE - autoFocus is a Javascript thing
    expect(inputElement).not.toHaveAttribute("disabled");
    expect(inputElement).toHaveAttribute("id", NAME);
    expect(inputElement).toHaveAttribute("placeholder", PLACEHOLDER);
    expect(inputElement).toHaveAttribute("size", "" + HTML_SIZE);
    expect(inputElement).toHaveAttribute(VALUE, "");

    userEvent.type(inputElement, "abc{enter}");
    expect(inputElement).toHaveValue("abc");
    expect(lastChange).toBe("abc");
    expect(lastValue).toBe("abc");

});

test("renders correctly with minimal properties", () => {

    const LABEL = "Search For:";    // Default value

    render(<SearchBar/>);

    const inputElement = screen.getByLabelText(LABEL);
    expect(inputElement).toBeInTheDocument();
    // NOTE - console.log("inputElement", prettyDOM(inputElement));
    expect(inputElement).toHaveAttribute("id", "searchBar"); // Default value
    expect(inputElement).toHaveAttribute("value", "");

});
