require "rails_helper"

describe "Show password", type: :view do
  def component_name
    "show_password"
  end

  it "fails to render when no label is given" do
    assert_raises do
      render_component({})
    end
  end

  it "renders correctly" do
    render_component(
      label: {
        text: "Your password",
      },
    )

    assert_select(".gem-c-show-password[data-module='show-password']")
    assert_select(".gem-c-show-password[data-show='Show']")
    assert_select(".gem-c-show-password[data-hide='Hide']")
    assert_select(".gem-c-show-password[data-announce-show='Your password is shown']")
    assert_select(".gem-c-show-password[data-announce-hide='Your password is hidden']")
    assert_select(".gem-c-input[autocomplete='off']")
    assert_select(".gem-c-input[type='password']")
  end

  it "renders with autocomplete current password" do
    render_component(
      label: {
        text: "Your password",
      },
      autocomplete: "current-password",
    )

    assert_select(".gem-c-input[autocomplete='current-password']")
  end

  it "renders with autocomplete off if invalid entry is passed for autocomplete" do
    render_component(
      label: {
        text: "Your password",
      },
      autocomplete: "this-is-totally-not-a-thing",
    )

    assert_select(".gem-c-input[autocomplete='off']")
  end
end
