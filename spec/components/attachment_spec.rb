require "rails_helper"

describe "Attachment", type: :view do
  def component_name
    "attachment"
  end

  it "fails to render when no attachment is given" do
    assert_raises do
      render_component({})
    end
  end

  it "renders an attachment" do
    render_component(attachment: { title: "Attachment", url: "https://gov.uk/attachment" })
    assert_select ".gem-c-attachment"
    assert_select "a[href='https://gov.uk/attachment']", text: "Attachment"
  end

  it "can have a target specified" do
    render_component(
      attachment: { title: "Attachment", url: "https://gov.uk/attachment" },
      target: "_blank",
    )
    assert_select "a[href='https://gov.uk/attachment'][target=_blank]"
  end

  it "can include attribute metadata" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "application/pdf",
        file_size: 2048,
        number_of_pages: 2,
      },
    )
    assert_select "abbr.gem-c-attachment__abbr[title='Portable Document Format']", text: "PDF"
    expect(rendered).to match(/2 KB/)
    expect(rendered).to match(/2 pages/)
  end

  it "can show file type that doesn't have an abbreviation" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "text/plain",
      },
    )
    expect(rendered).to match(/Plain Text/)
  end

  it "doesn't show metadata information when there isn't any to show" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "unknown/type",
      },
    )

    assert_select ".gem-c-attachment__metadata", false
  end

  it "shows OpenDocument help text if OpenDocument format" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "application/vnd.oasis.opendocument.spreadsheet",
      },
    )
    assert_select "a[href='https://www.gov.uk/guidance/using-open-document-formats-odf-in-your-organisation']"
  end

  it "shows section to request a different format if a contact email is provided" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "application/vnd.oasis.opendocument.spreadsheet",
        alternative_format_contact_email: "defra.helpline@defra.gsi.gov.uk",
      },
    )
    assert_select "a[href='mailto:defra.helpline@defra.gsi.gov.uk']"
  end

  it "does not show opendocument metadata if disabled" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "application/vnd.oasis.opendocument.spreadsheet",
      },
      hide_opendocument_metadata: true,
    )
    assert_select "a[href='https://www.gov.uk/guidance/open-document-format-odf-guidance-for-uk-government/overview-of-productivity-software']", false
  end

  it "embeds any specified data attributes into the links" do
    render_component(
      attachment: {
        title: "Attachment",
        url: "attachment",
        content_type: "application/vnd.oasis.opendocument.spreadsheet",
      },
      data_attributes: { gtm: "attachment-preview" },
    )

    assert_select ".gem-c-attachment__thumbnail a.govuk-link[data-gtm='attachment-preview']"
    assert_select ".gem-c-attachment__title a.govuk-link[data-gtm='attachment-preview']"
  end

  it "shows reference details on the first metadata line if provided" do
    render_component(
      attachment: {
          title: "The government financial reporting review",
          url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/791567/the_government_financial_reporting_review_web.pdf",
          filename: "department-for-transport-information-asset-register.csv",
          content_type: "application/pdf",
          file_size: 20000,
          number_of_pages: 7,
          isbn: "978-1-5286-1173-2",
          unique_reference: "2259",
          command_paper_number: "Cd. 67",
        },
      )
    assert_select ".gem-c-attachment__metadata:nth-of-type(1)", text: "Ref: ISBN 978-1-5286-1173-2, 2259, Cd. 67"
  end

  it "shows unnumbered details on the second metadata line if marked so" do
    render_component(
      attachment: {
          title: "The government financial reporting review",
          url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/791567/the_government_financial_reporting_review_web.pdf",
          filename: "department-for-transport-information-asset-register.csv",
          content_type: "application/pdf",
          file_size: 20000,
          number_of_pages: 7,
          isbn: "978-1-5286-1173-2",
          unique_reference: "2259",
          unnumbered_command_paper: true,
        },
      )
    assert_select ".gem-c-attachment__metadata:nth-of-type(2)", text: "Unnumbered command paper"
  end
end
