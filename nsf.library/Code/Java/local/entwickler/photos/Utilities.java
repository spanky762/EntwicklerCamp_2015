package local.entwickler.photos;

import java.io.Serializable;

import lotus.domino.Base;
import lotus.domino.NotesException;

public class Utilities implements Serializable {

	public static final int EQUAL = 0;
	public static final int LESS_THAN = -1;
	public static final int GREATER_THAN = 1;

	private static final long serialVersionUID = 1L;

	/**
	 * Zero-Argument Constructor
	 */
	public Utilities() {
	}

	/**
	 * Tim Tripcony's awsomely simple incinerate method handles recycle issues
	 * for Domino Objects.
	 * 
	 * @param dominoObjects
	 *            Domino Objects to recycle.
	 */
	public static void incinerate(Object... dominoObjects) {
		for (Object dominoObject : dominoObjects) {
			if (null != dominoObject) {
				if (dominoObject instanceof Base) {
					try {
						((Base) dominoObject).recycle();
					} catch (NotesException recycleSucks) {
						// optionally log exception
					}
				}
			}
		}
	}
}
