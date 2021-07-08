package main

// reference: https://github.com/google/go-github/blob/master/scrape/forms.go

import (
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
)

// htmlForm represents the basic elements of an HTML Form.
type htmlForm struct {
	// Action is the URL where the form will be submitted
	Action string
	// Method is the HTTP method to use when submitting the form
	Method string
	// Values contains form values to be submitted
	Values url.Values
}

// parseForms parses and returns all form elements beneath node.  Form values
// include all input and textarea elements within the form. The values of radio
// and checkbox inputs are included only if they are checked.
//
// In the future, we might want to allow a custom selector to be passed in to
// further restrict what forms will be returned.
func parseForms(node *html.Node) (forms []htmlForm) {
	if node == nil {
		return nil
	}

	doc := goquery.NewDocumentFromNode(node)
	doc.Find("form").Each(func(_ int, s *goquery.Selection) {
		form := htmlForm{Values: url.Values{}}
		form.Action, _ = s.Attr("action")
		form.Method, _ = s.Attr("method")

		s.Find("input").Each(func(_ int, s *goquery.Selection) {
			name, _ := s.Attr("name")
			if name == "" {
				return
			}

			typ, _ := s.Attr("type")
			typ = strings.ToLower(typ)
			_, checked := s.Attr("checked")
			if (typ == "radio" || typ == "checkbox") && !checked {
				return
			}

			value, _ := s.Attr("value")
			form.Values.Add(name, value)
		})
		s.Find("textarea").Each(func(_ int, s *goquery.Selection) {
			name, _ := s.Attr("name")
			if name == "" {
				return
			}

			value := s.Text()
			form.Values.Add(name, value)
		})
		s.Find("select").Each(func(_ int, s *goquery.Selection) {
			name, _ := s.Attr("name")
			if name == "" {
				return
			}
			s.Find("option").Each(func(_ int, s *goquery.Selection) {
				_, exists := s.Attr("selected")
				if !exists {
					return
				}
				value, _ := s.Attr("value")
				form.Values.Add(name, value)
			})
		})
		forms = append(forms, form)
	})

	return forms
}
